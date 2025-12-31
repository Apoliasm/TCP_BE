import { Test } from '@nestjs/testing';
import { BadRequestException } from '@nestjs/common';
import { ListingsService } from './listings.service';
import { PrismaService } from '../database/prisma.service';
import { ListingItemsService } from './listings-items.service';
import { ListingStatus } from '@prisma/client';

describe('ListingsService', () => {
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
    listing: {
      findMany: jest.fn(),
      findUnique: jest.fn(),
    },
    // ❗️지금 네 서비스 코드는 트랜잭션 내부에서 여기(this.prisma)를 호출 중이라
    // 테스트로 버그를 잡으려면 이쪽을 감시하는 것도 방법임.
    listingImage: {
      updateMany: jest.fn(),
    },
  };

  const listingItemsServiceMock = {
    createListingItem: jest.fn(),
  };

  beforeEach(async () => {
    jest.clearAllMocks();

    const moduleRef = await Test.createTestingModule({
      providers: [
        ListingsService,
        { provide: PrismaService, useValue: prismaMock },
        { provide: ListingItemsService, useValue: listingItemsServiceMock },
      ],
    }).compile();

    service = moduleRef.get(ListingsService);

    // $transaction 안 콜백을 실제 실행하게
    prismaMock.$transaction.mockImplementation(async (cb: any) => cb(txMock));
  });

  describe('create', () => {
    it('items가 없으면 BadRequest', async () => {
      await expect(
        service.create({
          userId: 1,
          title: 't',
          status: ListingStatus.ON_SALE,
          images: [],
          items: [],
        } as any),
      ).rejects.toBeInstanceOf(BadRequestException);
    });

    it('images가 없으면 BadRequest', async () => {
      await expect(
        service.create({
          userId: 1,
          title: 't',
          status: ListingStatus.ON_SALE,
          items: [{ name: 'x', pricePerUnit: 1, quantity: 1 } as any],
        } as any),
      ).rejects.toBeInstanceOf(BadRequestException);
    });

    it('정상 흐름: listing 생성 -> item 생성 호출 -> image 연결 -> 최종 조회', async () => {
      txMock.listing.create.mockResolvedValue({ id: 123 });
      txMock.listing.findUnique.mockResolvedValue({ id: 123, title: 'ok' });

      listingItemsServiceMock.createListingItem.mockResolvedValue([{ id: 1 }]);
      txMock.listingImage.updateMany.mockResolvedValue({ count: 1 });

      const dto = {
        userId: 1,
        title: '블루아이즈 시크릿 팝니다',
        memo: '직거래 선호 / 네고X',
        status: ListingStatus.ON_SALE,
        images: [{ id: 12, url: 'string', order: 0 }],
        items: [
          {
            listingImageId: 12,
            name: '블루아이즈 시크릿',
            pricePerUnit: 8000,
            unit: 1,
            detailText: '미개봉 / 생활기스 있음',
            quantity: 1,
          },
        ],
      };

      const result = await service.create(dto as any);

      // 1) listing 생성
      expect(txMock.listing.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            title: dto.title,
            userId: dto.userId,
            status: dto.status,
            // ⚠️ memo 저장하고 싶으면 service에 memo도 넣어야 함
          }),
          select: { id: true },
        }),
      );

      // 2) item 생성 호출 (tx 전달 확인)
      expect(listingItemsServiceMock.createListingItem).toHaveBeenCalledWith(
        123,
        dto.items,
        txMock,
      );

      // 3) 이미지 연결: “정상 설계”라면 txMock로 updateMany가 호출돼야 함
      // ✅ 네가 tx로 고치면 아래가 통과
      expect(txMock.listingImage.updateMany).toHaveBeenCalledWith({
        where: { id: { in: [12] } },
        data: { listingId: 123 },
      });

      // ❌ 현재 코드 그대로면 (this.prisma.listingImage.updateMany 호출)
      // 아래처럼 “트랜잭션 밖 호출”이 일어났는지도 체크해서 버그를 잡을 수 있음:
      // expect(prismaMock.listingImage.updateMany).toHaveBeenCalled();

      // 4) 최종 조회
      expect(txMock.listing.findUnique).toHaveBeenCalledWith({
        where: { id: 123 },
      });

      expect(result).toEqual({ id: 123, title: 'ok' });
    });
  });
});
