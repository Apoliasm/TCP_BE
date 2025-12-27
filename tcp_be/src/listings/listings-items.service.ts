import { Injectable, BadRequestException } from '@nestjs/common';
import { PrismaService } from 'src/database/prisma.service';
import { ItemsService } from 'src/items/items.service';
import {
  CreateListingItemAccessory,
  CreateListingItemCard,
  CreateListingItemCommon,
  CreateListingItemDto,
} from './dto/listing-item.dto';
import {
  CardCandidates,
  CardNation,
  ListingItem,
  ListingItemType,
  Prisma,
} from '@prisma/client';
import {
  CreateAccessoryInfoDto,
  CreateCardInfoDto,
} from 'src/items/dto/items-info.dto';

@Injectable()
export class ListingItemsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly itemsService: ItemsService,
  ) {}

  private async findUniqueItem(
    item: CreateListingItemDto,
    client: Prisma.TransactionClient | PrismaService,
  ) {
    if (item.type === ListingItemType.CARD) {
      if (item.cardInfo.candidateId) {
        return client.cardInfo.findUnique({
          where: {
            candidateId_rarity: {
              candidateId: item.cardInfo.candidateId,
              rarity: item.cardInfo.rarity,
            },
          },
        });
      } else if (item.cardInfo.cardNameId) {
        return client.cardInfo.findUnique({
          where: {
            cardNameId_rarity: {
              cardNameId: item.cardInfo.cardNameId,
              rarity: item.cardInfo.rarity,
            },
          },
        });
      }
    } else if (item.type === ListingItemType.ACCESSORY) {
      return client.accessoryInfo.findUnique({
        where: {
          name: item.accessoryInfo.name,
        },
      });
    }
  }
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

  async createListingItem(
    listingId: number,
    items: CreateListingItemDto[],
    tx?: Prisma.TransactionClient,
  ) {
    let client: Prisma.TransactionClient | PrismaService = this.prisma;
    if (tx) client = tx;
    if (!items?.length)
      throw new BadRequestException('생성할 ListingItem이 없습니다.');

    //0) 카드와 악세사리 분리
    const cardItems: CreateListingItemCard[] = [];

    const accessoryItems: CreateListingItemAccessory[] = [];
    const listingItems: Prisma.ListingItemCreateManyInput[] = [];
    // 1) 들어온 카드 정보, rarity로 unique 체크, 없으면 새로 생성, 있으면 재사용
    let listingItem: Prisma.ListingItemCreateManyInput;
    for (const item of items) {
      //cardInfo에서 기존에 있는 정보인지 체크

      let unique = await this.findUniqueItem(item, client);
      //이미 있는 데이터면 그대로 활용
      if (unique) {
        let infoId = unique.itemInfoId;
        listingItem = { listingId, infoId, ...item };
        listingItems.push({ ...listingItem });
      } else {
        let infoId: number;
        if (item.type === ListingItemType.CARD) {
          let { cardInfo, ...rest } = item;
          const itemInfo = await client.itemInfo.create({
            data: {
              type: item.type,
              cardInfo: {
                create: {
                  ...rest,
                  nation: CardNation.KR,
                  rarity: item.cardInfo.rarity,
                },
              },
            },
            select: {
              id: true,
            },
          });
          infoId = itemInfo.id;
        } else if (item.type === ListingItemType.ACCESSORY) {
          const itemInfo = await client.itemInfo.create({
            data: {
              type: item.type,
              accessoryInfo: {
                create: {
                  name: item.accessoryInfo.name,
                },
              },
            },
            select: {
              id: true,
            },
          });
          infoId = itemInfo.id;
        } else {
          throw Error('[listingItem] 생성 에러  ');
        }
        listingItem = { ...item, listingId, infoId };
        listingItems.push({ ...listingItem });
      }
    }
    const createMany = await client.listingItem.createMany({
      data: listingItems,
    });

    return createMany;
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
