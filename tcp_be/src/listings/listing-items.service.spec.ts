import { Test } from '@nestjs/testing';
import { BadRequestException } from '@nestjs/common';
import { ListingItemsService } from './listings-items.service';
import { PrismaService } from 'src/database/prisma.service';

describe('ListingItemsService', () => {
  let service: ListingItemsService;

  const prismaMock = {
    item: {
      createManyAndReturn: jest.fn(),
    },
  };

  beforeEach(async () => {
    jest.clearAllMocks();
    const moduleRef = await Test.createTestingModule({
      providers: [
        ListingItemsService,
        { provide: PrismaService, useValue: prismaMock },
      ],
    }).compile();

    service = moduleRef.get(ListingItemsService);
  });

  it('items가 비면 BadRequest', async () => {
    await expect(
      service.createListingItem(1, [] as any),
    ).rejects.toBeInstanceOf(BadRequestException);
  });

  it('정상: listingId 주입해서 createManyAndReturn 호출', async () => {
    prismaMock.item.createManyAndReturn.mockResolvedValue([
      { id: 10 },
      { id: 11 },
    ]);

    const items = [
      { name: 'A', pricePerUnit: 1000, quantity: 1 },
      { name: 'B', pricePerUnit: 2000, quantity: 2 },
    ] as any;

    const result = await service.createListingItem(123, items);

    expect(prismaMock.item.createManyAndReturn).toHaveBeenCalledWith({
      data: [
        { ...items[0], listingId: 123 },
        { ...items[1], listingId: 123 },
      ],
      select: { id: true },
    });

    expect(result).toEqual([{ id: 10 }, { id: 11 }]);
  });
});
