// src/listings/listings.service.ts
import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../database/prisma.service';
import { CreateListingDto } from './dto/listing.dto';
import { ListingItemsService } from './listings-items.service';

@Injectable()
export class ListingsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly listingItem: ListingItemsService,
  ) {}

  async create(dto: CreateListingDto) {
    if (!dto.items?.length) {
      throw new BadRequestException('생성할 ListingItem이 없습니다.');
    }

    return this.prisma.$transaction(async (tx) => {
      // 1) listing 생성
      const listing = await tx.listing.create({
        data: {
          title: dto.title,
          sellerId: dto.sellerId,
          status: dto.status, // 없으면 default 적용
        },
        select: { id: true },
      });

      // 2) listingItem 생성 (같은 트랜잭션 tx로)
      await this.listingItem.createListingItemTx(tx, listing.id, dto.items);

      // 3) 업로드된 이미지 일괄 연결 (updateMany 1번)
      const imageIds = (dto.images ?? []).map((img) => img.id).filter(Boolean);
      if (imageIds.length) {
        // (선택) 다른 listing에 이미 연결된 이미지가 섞이지 않도록 보호
        // 조건을 { listingId: null } 로 제한하면 더 안전
        await tx.listingImage.updateMany({
          where: {
            id: { in: imageIds },
            listingId: null,
          },
          data: { listingId: listing.id },
        });
      }

      // 4) 최종 결과 반환 (tx 내부에서 1번 조회)
      return tx.listing.findUnique({
        where: { id: listing.id },
        include: {
          images: true,
          items: {
            include: {
              itemInfo: {
                include: {
                  cardInfo: { include: { cardName: true, candidate: true } },
                  accessoryInfo: true,
                },
              },
              listingImage: true,
            },
          },
        },
      });
    });
  }

  findAll() {
    return this.prisma.listing.findMany({
      include: {
        items: {
          select: { id: true },
        },
        seller: true,
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(id: number) {
    const listing = await this.prisma.listing.findUnique({
      where: { id },
      include: {
        images: {
          orderBy: { order: 'asc' },
          include: {
            items: true,
          },
        },
      },
    });

    if (!listing) throw new NotFoundException('Listing not found');
    return listing;
  }
}
