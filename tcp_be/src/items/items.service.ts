import { Injectable, BadRequestException } from '@nestjs/common';
import { PrismaService } from 'src/database/prisma.service';
import {
  CreateCardInfoDto,
  CreateAccessoryInfoDto,
} from 'src/items/dto/items-info.dto';
import { ListingItemType } from '@prisma/client';
import { NotFoundException } from '@nestjs/common';

@Injectable()
export class ItemsService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * info 로직
   * 1. 먼저 기존에 info 있는지 체크 -> 카드: cardCode(+rarity), 악세: name
   * 2. 없으면 ItemInfo 먼저 만들기
   * 3. 타입에 따라 CardInfo / AccessoryInfo 생성 (itemInfoId = ItemInfo.id)
   *
   * 반환: 사용된 ItemInfo (혹은 itemInfoId)
   */
  async createItemInfo(dto: CreateCardInfoDto | CreateAccessoryInfoDto) {
    return this.prisma.$transaction(async (tx) => {
      // 1) 카드인 경우
      if ('cardCode' in dto) {
        // 1-1. 기존 CardInfo 있는지 확인 (cardCode는 @unique)
        const existingCardInfo = await tx.itemInfo.findFirst({
          where: {
            cardInfo: {
              cardCode: dto.cardCode,
              rarity: dto.rarity,
            },
          },
        });
        if (existingCardInfo) return existingCardInfo;
        // 2. ItemInfo 먼저 생성
        const itemInfo = await tx.itemInfo.create({
          data: {
            type: ListingItemType.CARD,
          },
        });

        // 3. CardInfo 생성 (PK+FK = itemInfo.id)
        await tx.cardInfo.create({
          data: {
            itemInfoId: itemInfo.id,
            cardCode: dto.cardCode,
            nation: dto.nation,
            rarity: dto.rarity,
            cardNameId: dto.cardNameId ?? null,
            candidateId: dto.candidateId ?? null,
          },
        });

        return itemInfo;
      }

      // 2) 악세서리인 경우 ('name' 속성이 있는 DTO라고 가정)
      else if ('name' in dto) {
        // 1-1. 기존 AccessoryInfo 있는지 확인
        const existingAccessoryInfo = await tx.accessoryInfo.findFirst({
          where: { name: dto.name },
          include: { itemInfo: true },
        });

        if (existingAccessoryInfo) {
          return existingAccessoryInfo.itemInfo;
        }

        // 2. ItemInfo 생성
        const itemInfo = await tx.itemInfo.create({
          data: {
            type: ListingItemType.ACCESSORY,
          },
        });

        // 3. AccessoryInfo 생성
        await tx.accessoryInfo.create({
          data: {
            itemInfoId: itemInfo.id,
            name: dto.name,
          },
        });

        return itemInfo;
      }

      throw new BadRequestException('지원하지 않는 info 타입입니다.');
    });
  }

  async findItemInfo(id: number) {
    const itemInfo = await this.prisma.itemInfo.findUnique({
      where: { id },
      include: {
        cardInfo: {
          include: {
            cardName: true,
            candidate: true,
          },
        },
        accessoryInfo: true,
        listingItems: true,
      },
    });

    if (!itemInfo) {
      throw new NotFoundException('ItemInfo를 찾을 수 없습니다.');
    }

    return itemInfo;
  }

  async searchItemInfo(nameQuery: string) {
    const searchResults = await this.prisma.itemInfo.findMany({
      where: {
        OR: [
          {
            cardInfo: {
              cardName: {
                name: {
                  contains: nameQuery,
                  mode: 'insensitive',
                },
              },
            },
          },
          {
            cardInfo: {
              candidate: {
                name: {
                  contains: nameQuery,
                  mode: 'insensitive',
                },
              },
            },
          },
          {
            accessoryInfo: {
              name: {
                contains: nameQuery,
                mode: 'insensitive',
              },
            },
          },
        ],
      },

      include: {
        cardInfo: {
          include: {
            candidate: true,
            cardName: true,
          },
        },
        accessoryInfo: true,
      },
    });

    return searchResults;
  }
}
