import { Test } from '@nestjs/testing';
import { BadRequestException } from '@nestjs/common';
import { ListingsService } from './listings.service';
import { PrismaService } from '../database/prisma.service';
import { ListingItemsService } from './listings-items.service';

describe('ListingsService (unit)', () => {
  let service: ListingsService;

  const txMock = {
    listing: {
      create: jest.fn(),
      findUnique: jest.fn(),
    },
    listingImage: {
      updateMany: jest.fn(),
    },
  };

  const prismaMock = {
    $transaction: jest.fn(),
  };

  const listingItemsMock = {
    createListingItemTx: jest.fn(),
  };

  beforeEach(async () => {
    jest.clearAllMocks();

    // $transaction 콜백을 실행해 주도록 mock
    prismaMock.$transaction.mockImplementation(async (cb: any) => cb(txMock));

    const moduleRef = await Test.createTestingModule({
      providers: [
        ListingsService,
        { provide: PrismaService, useValue: prismaMock },
        { provide: ListingItemsService, useValue: listingItemsMock },
      ],
    }).compile();

    service = moduleRef.get(ListingsService);

    txMock.listing.create.mockResolvedValue({ id: 123 });
    txMock.listing.findUnique.mockResolvedValue({ id: 123, ok: true });
    txMock.listingImage.updateMany.mockResolvedValue({ count: 2 });
    listingItemsMock.createListingItemTx.mockResolvedValue(undefined);
  });

  it('items가 없으면 BadRequestException', async () => {
    await expect(
      service.create({ title: 't', sellerId: 1, items: [] } as any),
    ).rejects.toBeInstanceOf(BadRequestException);
  });

  it('정상 흐름: listing 생성 -> items 생성(tx) -> images updateMany(optional) -> findUnique 반환', async () => {
    const dto = {
      title: '게시글 제목',
      sellerId: 1,
      status: 'ON_SALE',
      items: [{ type: 'CARD', infoId: null, detail: 'd' }],
      images: [
        { id: 10, order: 0 },
        { id: 0, order: 1 },
        { id: 20, order: 2 },
      ],
    };

    const result = await service.create(dto as any);

    expect(prismaMock.$transaction).toHaveBeenCalledTimes(1);

    expect(txMock.listing.create).toHaveBeenCalledWith({
      data: { title: dto.title, sellerId: dto.sellerId, status: dto.status },
      select: { id: true },
    });

    expect(listingItemsMock.createListingItemTx).toHaveBeenCalledWith(
      txMock,
      123,
      dto.items,
    );

    // id가 truthy인 것만 들어가야 함: [10,20]
    expect(txMock.listingImage.updateMany).toHaveBeenCalledWith({
      where: { id: { in: [10, 20] }, listingId: null },
      data: { listingId: 123 },
    });

    expect(txMock.listing.findUnique).toHaveBeenCalledTimes(1);
    expect(result).toEqual({ id: 123, ok: true });
  });

  it('images가 없으면 updateMany를 호출하지 않는다', async () => {
    const dto = {
      title: 't',
      sellerId: 1,
      status: 'ON_SALE',
      items: [{ type: 'CARD', infoId: null }],
      images: [],
    };

    await service.create(dto as any);

    expect(txMock.listingImage.updateMany).not.toHaveBeenCalled();
  });
});
