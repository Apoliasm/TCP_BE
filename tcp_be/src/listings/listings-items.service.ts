import { Injectable, BadRequestException } from '@nestjs/common';
import { PrismaService } from 'src/database/prisma.service';
import { ItemsService } from 'src/items/items.service';
import { CreateListingItemDto } from './dto/listing-item.dto';
import {
  CardCandidates,
  ItemInfo,
  ListingItem,
  ListingItemType,
} from '@prisma/client';

@Injectable()
export class ListingItemsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly itemsService: ItemsService,
  ) {}

  /**
   * listing이 생성된 이후, 해당 listing에 연결될 ListingItem들을 한 번에 만든다.
   *
   * - listingId: 방금 생성된 Listing의 id
   * - items: 클라이언트가 작성 완료한 item DTO 목록
   *
   * 주의: 여기서는 각 item마다 ItemsService.createItemInfo()를 호출해서
   *       ItemInfo(+CardInfo/AccessoryInfo)를 만들거나 재사용한 뒤,
   *       ListingItem.infoId로 연결한다.
   */
  async createForListing(listingId: number, items: CreateListingItemDto[]) {
    if (!items || items.length === 0) {
      throw new BadRequestException('생성할 ListingItem이 없습니다.');
    }

    const createdItems: ListingItem[] = [];

    // 비동기 루프 (for...of + await: 순차 실행 / 필요하면 Promise.all로 병렬화도 가능)
    for (const item of items) {
      // 1_ ItemInfo를 type에 따라 캐스팅하기
      const itemInfoDto =
        item.type === 'CARD'
          ? item.cardInfo
          : item.type === 'ACCESSORY'
            ? item.accessoryInfo
            : undefined;
      if (!itemInfoDto) continue;

      // 2) 처음 등록되는 카드 이름이라면 후보군 테이블에 등록하기
      let newCardCandidate: null | CardCandidates = null;
      if (
        item.type === 'CARD' &&
        !item.cardInfo?.cardNameId &&
        !item.cardInfo?.candidateId &&
        item.cardInfo?.candidateInfo
      ) {
        newCardCandidate = await this.prisma.cardCandidates.create({
          data: {
            name: item.cardInfo.candidateInfo.name,
          },
        });
        if (!newCardCandidate)
          throw new BadRequestException('CardCandidate 생성에 실패했습니다');
        item.cardInfo.candidateId = newCardCandidate.id;
      }

      // 3) ItemInfo(+CardInfo/AccessoryInfo) 생성 or 재사용
      //    - 카드인 경우: cardCode 기준으로 기존 CardInfo 있으면 해당 ItemInfo 재사용
      //    - 악세서리인 경우: name 기준으로 기존 AccessoryInfo 있으면 해당 ItemInfo 재사용
      const postItemInfo = await this.itemsService.createItemInfo(itemInfoDto);
      if (!postItemInfo) {
        throw new BadRequestException('ItemInfo 생성에 실패했습니다');
      }

      // 4) ListingItem 실제 생성 (Listing + ItemInfo 연결)
      const created = await this.prisma.listingItem.create({
        data: {
          listingId,
          infoId: postItemInfo.id,
          detail: item.detail,
          condition: item.condition,
          quantity: item.quantity,
          pricePerUnit: item.pricePerUnit,
        },
      });

      createdItems.push(created);
    }

    return createdItems;
  }

  /**
   * 특정 listing에 달려 있는 ListingItem 목록 조회
   */
  async findByListing(listingId: number) {
    return this.prisma.listingItem.findMany({
      where: { listingId },
      include: {
        itemInfo: {
          include: {
            cardInfo: {
              include: {
                cardName: true,
                candidate: true,
              },
            },
            accessoryInfo: true,
          },
        },
      },
      orderBy: { id: 'asc' },
    });
  }

  /**
   * ListingItem 하나 조회
   */
  async findOne(id: number) {
    return this.prisma.listingItem.findUnique({
      where: { id },
      include: {
        itemInfo: {
          include: {
            cardInfo: {
              include: {
                cardName: true,
                candidate: true,
              },
            },
            accessoryInfo: true,
          },
        },
      },
    });
  }

  /**
   * 특정 listing에 달린 ListingItem들을 한 번에 삭제
   * (listing 삭제 전에 정리하거나, 재작성 시 초기화용)
   */
  async removeByListing(listingId: number) {
    await this.prisma.listingItem.deleteMany({
      where: { listingId },
    });
  }
}
