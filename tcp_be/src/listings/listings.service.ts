// src/listings/listings.service.ts
import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../database/prisma.service';
import { CreateListingDto, ListingSummaryResponseDto } from './dto/listing.dto';
import { ListingItemsService } from './listings-items.service';
import { Prisma } from '@prisma/client';

@Injectable()
export class ListingsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly listingItem: ListingItemsService,
  ) {}

  async create(dto: CreateListingDto) {
    return this.prisma.$transaction(async (tx) => {
      if (!dto.items || dto.items.length === 0) {
        throw new BadRequestException('추가할 item이 없습니다.');
      }

      if (!dto.images || dto.images.length === 0) {
        throw new BadRequestException('추가할 이미지가 없습니다.');
      }
      // 1) listing 생성
      const listing = await tx.listing.create({
        data: {
          title: dto.title,
          userId: dto.userId,
          status: dto.status, // 없으면 default 적용
        },
        select: { id: true },
      });

      // 2) listingItem 생성 (같은 트랜잭션 tx로)

      const itemsInput = this.listingItem.createListingItem(
        listing.id,
        dto.items,
        tx,
      );

      // 3) 업로드된 이미지를 게시글과 일괄 연결

      const imageIds = dto.images
        .map((img) => img.id)
        .filter((id): id is number => typeof id === 'number');

      if (imageIds.length > 0) {
        await tx.listingImage.updateMany({
          where: {
            id: { in: imageIds },
          },
          data: {
            listingId: listing.id, // 또는 원하는 listingId
          },
        });
      }

      // 4) 최종 결과 반환 (tx 내부에서 1번 조회)
      return tx.listing.findUnique({
        where: { id: listing.id },
      });
    });
  }

  async findAll() {
    return this.getListingItemSummary();
  }

  async findOne(id: number) {
    const listing = await this.prisma.listing.findUnique({
      where: { id },
      include: {
        images: {
          omit: {
            createdAt: true,
          },
          include: {
            items: {
              omit: {
                createdAt: true,
                updatedAt: true,
              },
            },
          },
        },
      },
    });

    if (!listing) throw new NotFoundException('Listing not found');
    return listing;
  }

  async findListingIdsByItemName(
    q: string,
  ): Promise<ListingSummaryResponseDto[]> {
    const keyword = q.trim();
    if (!keyword) return [];

    const rows = await this.prisma.item.findMany({
      where: {
        name: {
          contains: keyword,
          mode: 'insensitive', // 대소문자 무시(가능한 DB/Collation에서 동작)
        },
      },
      select: {
        listingId: true,
      },
      distinct: ['listingId'], // listingId 중복 제거
      take: 200, // 안전장치(원하면 조절)
    });
    const ids = rows.map((row) => row.listingId);

    return this.getListingItemSummary(ids);
  }

  private async getListingItemSummary(ids?: number[]) {
    const args = {
      include: {
        images: true,
        user: true,
        items: {
          select: {
            name: true,
            id: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
      ...(ids?.length
        ? {
            where: {
              id: { in: ids },
            },
          }
        : {}),
    } satisfies Prisma.ListingFindManyArgs;

    try {
      const findMany = await this.prisma.listing.findMany(args);

      const summary: ListingSummaryResponseDto[] = findMany.map((item) => {
        const { images, user, ...rest } = item;
        return {
          ...rest,
          userId: user.id,
          useNickName: user.nickname,
          thumbnailURL: images[0]?.url ?? '',
        };
      });

      console.log(summary);

      return summary;
    } catch (error) {
      throw error;
    }
  }
}
