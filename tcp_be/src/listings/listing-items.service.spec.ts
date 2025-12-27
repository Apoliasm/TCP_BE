import { BadRequestException } from '@nestjs/common';
import { ListingItemsService } from './listings-items.service';
import { ListingItemType } from '@prisma/client';

describe('ListingItemsService.createListingItem (unit)', () => {
  let service: ListingItemsService;

  const prismaMock = {}; // createListingItem에서 tx를 넘기면 prisma 안 씀
  const itemsServiceMock = {};

  beforeEach(() => {
    jest.clearAllMocks();
    service = new ListingItemsService(
      prismaMock as any,
      itemsServiceMock as any,
    );
  });

  it('items가 없으면 BadRequestException', async () => {
    const tx = {} as any;
    await expect(service.createListingItem(1, [], tx)).rejects.toBeInstanceOf(
      BadRequestException,
    );
  });

  it('CARD: 기존 cardInfo가 없으면(cardInfo.findUnique -> null) itemInfo.create -> createMany', async () => {
    const tx: any = {
      cardInfo: {
        findUnique: jest.fn().mockResolvedValue(null), // ✅ 없다고 가정
      },
      itemInfo: {
        create: jest.fn().mockResolvedValue({ id: 888 }),
      },
      listingItem: {
        createMany: jest.fn().mockResolvedValue({ count: 1 }),
      },
    };

    const items: any[] = [
      {
        type: ListingItemType.CARD,
        cardInfo: {
          // ✅ findUniqueItem은 candidateId/cardNameId를 본다
          candidateId: 777,
          rarity: 'UL',
          nation: 'KR',
        },
        detail: 'd',
        condition: 'c',
        quantity: 1,
        pricePerUnit: 1000,
        listingImageId: null,
      },
    ];

    await service.createListingItem(123, items as any, tx);

    // ✅ 먼저 unique 조회
    expect(tx.cardInfo.findUnique).toHaveBeenCalledWith({
      where: {
        candidateId_rarity: {
          candidateId: 777,
          rarity: 'UL',
        },
      },
    });

    // ✅ 없으니 itemInfo.create 호출
    expect(tx.itemInfo.create).toHaveBeenCalledTimes(1);

    // ✅ 최종 createMany 호출
    expect(tx.listingItem.createMany).toHaveBeenCalledTimes(1);
    const arg = tx.listingItem.createMany.mock.calls[0][0];

    expect(arg.data[0].listingId).toBe(123);
    expect(arg.data[0].infoId).toBe(888);
  });

  it('ACCESSORY: 기존 accessoryInfo가 없으면(findUnique -> null) itemInfo.create -> createMany', async () => {
    const tx: any = {
      accessoryInfo: {
        findUnique: jest.fn().mockResolvedValue(null),
      },
      itemInfo: {
        create: jest.fn().mockResolvedValue({ id: 500 }),
      },
      listingItem: {
        createMany: jest.fn().mockResolvedValue({ count: 1 }),
      },
    };

    const items: any[] = [
      {
        type: ListingItemType.ACCESSORY,
        accessoryInfo: { name: '플레이매트' },
        detail: 'd',
        condition: 'c',
        quantity: 1,
        pricePerUnit: 1000,
      },
    ];

    await service.createListingItem(123, items as any, tx);

    expect(tx.accessoryInfo.findUnique).toHaveBeenCalledWith({
      where: { name: '플레이매트' },
    });

    expect(tx.itemInfo.create).toHaveBeenCalledTimes(1);

    const arg = tx.listingItem.createMany.mock.calls[0][0];
    expect(arg.data[0].listingId).toBe(123);
    expect(arg.data[0].infoId).toBe(500);
  });

  it('CARD: 기존 cardInfo가 있으면(cardInfo.findUnique -> {itemInfoId}) itemInfo.create를 타지 않고 그 id를 재사용', async () => {
    const tx: any = {
      cardInfo: {
        findUnique: jest.fn().mockResolvedValue({ itemInfoId: 999 }),
      },
      itemInfo: {
        create: jest.fn(),
      },
      listingItem: {
        createMany: jest.fn().mockResolvedValue({ count: 1 }),
      },
    };

    const items: any[] = [
      {
        type: ListingItemType.CARD,
        cardInfo: {
          candidateId: 777,
          rarity: 'UL',
          nation: 'KR',
        },
        detail: 'd',
        condition: 'c',
        quantity: 1,
        pricePerUnit: 1000,
      },
    ];

    await service.createListingItem(123, items as any, tx);

    expect(tx.cardInfo.findUnique).toHaveBeenCalledTimes(1);
    expect(tx.itemInfo.create).not.toHaveBeenCalled();

    const arg = tx.listingItem.createMany.mock.calls[0][0];
    expect(arg.data[0].listingId).toBe(123);
    expect(arg.data[0].infoId).toBe(999);
  });
});
