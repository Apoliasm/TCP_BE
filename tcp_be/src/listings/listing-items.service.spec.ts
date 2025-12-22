import { BadRequestException } from '@nestjs/common';
import { ListingItemsService } from './listings-items.service';
import { ListingItemType, Prisma } from '@prisma/client';

describe('ListingItemsService.createListingItemTx (unit)', () => {
  let service: ListingItemsService;

  const prismaMock = {}; // createListingItemTx는 prisma를 직접 안 씀
  const itemsServiceMock = {}; // createListingItemTx는 itemsService를 직접 안 씀

  beforeEach(() => {
    service = new ListingItemsService(
      prismaMock as any,
      itemsServiceMock as any,
    );
    jest.clearAllMocks();
  });

  it('items가 없으면 BadRequestException', async () => {
    const tx = {} as Prisma.TransactionClient;

    await expect(service.createListingItemTx(tx, 1, [])).rejects.toBeInstanceOf(
      BadRequestException,
    );
  });

  it('CARD + candidateName + infoId null이면 upsert -> itemInfo.create -> infoId 매핑 -> createMany', async () => {
    const tx: any = {
      cardCandidates: {
        upsert: jest.fn().mockResolvedValue({ id: 777 }),
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
        infoId: null,
        cardInfo: {
          cardNameId: 1,
          candidateId: null,
          candidateInfo: { name: '섬도희-제로' },
          cardCode: 'DUAD-KR049',
          nation: 'KR',
          rarity: 'UL',
        },
        detail: 'd',
        condition: 'c',
        quantity: 1,
        pricePerUnit: 1000,
        listingImageId: null,
      },
    ];

    await service.createListingItemTx(tx, 123, items as any);

    expect(tx.cardCandidates.upsert).toHaveBeenCalledWith({
      where: { name: '섬도희-제로' },
      create: { name: '섬도희-제로' },
      update: {},
      select: { id: true },
    });

    // itemInfo.create에 candidateId=777로 들어갔는지
    expect(tx.itemInfo.create).toHaveBeenCalledWith({
      data: {
        type: ListingItemType.CARD,
        cardInfo: {
          create: {
            ...items[0].cardInfo,
            candidateId: 777,
          },
        },
      },
      select: { id: true },
    });

    // infoId 매핑이 되었는지
    expect(items[0].infoId).toBe(888);

    // createMany 데이터에 listingId가 붙어서 들어갔는지
    expect(tx.listingItem.createMany).toHaveBeenCalledTimes(1);
    const arg = tx.listingItem.createMany.mock.calls[0][0];
    expect(arg.data[0].listingId).toBe(123);
    expect(arg.data[0].infoId).toBe(888);
  });

  it('ACCESSORY + infoId null이면 itemInfo.create -> infoId 매핑', async () => {
    const tx: any = {
      cardCandidates: { upsert: jest.fn() },
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
        infoId: null,
        accessoryInfo: { name: '플레이매트' },
        detail: 'd',
        condition: 'c',
        quantity: 1,
        pricePerUnit: 1000,
      },
    ];

    await service.createListingItemTx(tx, 123, items as any);

    expect(tx.cardCandidates.upsert).not.toHaveBeenCalled();
    expect(tx.itemInfo.create).toHaveBeenCalled();
    expect(items[0].infoId).toBe(500);
  });

  it('이미 infoId가 있는 item은 upsert/itemInfo.create를 타지 않는다', async () => {
    const tx: any = {
      cardCandidates: { upsert: jest.fn() },
      itemInfo: { create: jest.fn() },
      listingItem: {
        createMany: jest.fn().mockResolvedValue({ count: 1 }),
      },
    };

    const items: any[] = [
      {
        type: ListingItemType.CARD,
        infoId: 999,
        cardInfo: { candidateInfo: { name: 'X' } },
        detail: 'd',
        condition: 'c',
        quantity: 1,
        pricePerUnit: 1000,
      },
    ];

    await service.createListingItemTx(tx, 123, items as any);

    expect(tx.cardCandidates.upsert).not.toHaveBeenCalled();
    expect(tx.itemInfo.create).not.toHaveBeenCalled();
    expect(tx.listingItem.createMany).toHaveBeenCalledTimes(1);
  });
});
