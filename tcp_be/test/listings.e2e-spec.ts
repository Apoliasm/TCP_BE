import { Test } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { AppModule } from '../src/app.module';
import { PrismaService } from '../src/database/prisma.service';
import { CreateListingItemDto } from 'src/listings/dto/listing-item.dto';

describe('POST /listings (e2e)', () => {
  let app: INestApplication;
  let prisma: PrismaService;

  // 테스트마다 DB를 “truncate/reset” 해서 독립성 확보
  const resetDb = async () => {
    // ⚠️ 스키마/테이블명은 너 prisma schema에 맞게 조정 필요
    // Postgres 기준 예시(관계/순서 때문에 CASCADE 권장)
    await prisma.$executeRawUnsafe(`TRUNCATE TABLE
      "ListingItem",
      "ItemInfo",
      "CardInfo",
      "AccessoryInfo",
      "CardCandidates",
      "ListingImage",
      "Listing",
      "User"
      RESTART IDENTITY CASCADE;`);
  };

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleRef.createNestApplication();
    await app.init();

    prisma = app.get(PrismaService);
  });

  afterAll(async () => {
    await app.close();
  });

  beforeEach(async () => {
    await resetDb();
  });

  it('items가 없으면 400', async () => {
    await request(app.getHttpServer())
      .post('/listings')
      .send({
        title: 't',
        userId: 1,
        status: 'ON_SALE',
        items: [],
      })
      .expect(400);
  });

  it('CARD + candidateInfo + infoId null -> 후보 upsert + ItemInfo 생성 + ListingItem 연결', async () => {
    // seller가 FK라면 미리 만들어야 함(너 schema에 seller(User) FK 있으면 필수)
    const seller = await prisma.user.create({ data: { nickname: 'seller1' } });
    const image = await prisma.listingImage.create({
      data: {
        imageUrl: '',
        order: 0,
      },
    });
    const res = await request(app.getHttpServer())
      .post('/listings')
      .send({
        title: '카드 판매글',
        userId: seller.id,
        status: 'ON_SALE',
        items: [
          {
            type: 'CARD',
            listingImageId: image.id,
            cardInfo: {
              candidateInfo: { name: '섬도희-제로' },
              cardCode: 'DUAD-KR049',
              nation: 'KR',
              rarity: 'UL',
            },
            detail: 'd',
            condition: 'c',
            quantity: 1,
            pricePerUnit: 1000,
          },
        ],
        images: [image.id],
      })
      .expect(201);

    // 1) 응답 구조 최소 검증
    expect(res.body.id).toBeTruthy();
    expect(res.body.items?.length).toBe(1);

    // 2) DB에 candidate가 실제로 생겼는지
    const candidate = await prisma.cardCandidates.findUnique({
      where: { name: '섬도희-제로' },
    });
    expect(candidate).toBeTruthy();

    // 3) ListingItem이 ItemInfo를 통해 cardInfo까지 이어졌는지
    const listingId = res.body.id;
    const listing = await prisma.listing.findUnique({
      where: { id: listingId },
      include: {
        items: { include: { itemInfo: { include: { cardInfo: true } } } },
      },
    });
    expect(listing?.items.length).toBe(1);
    expect(listing?.items[0].itemInfo?.cardInfo?.candidateId).toBe(
      candidate!.id,
    );
  });

  it('ACCESSORY + infoId null -> ItemInfo 생성 + ListingItem 연결', async () => {
    const seller = await prisma.user.create({ data: { nickname: 'seller2' } });
    const image = await prisma.listingImage.create({
      data: {
        imageUrl: '',
        order: 0,
      },
    });
    const res = await request(app.getHttpServer())
      .post('/listings')
      .send({
        title: '악세 판매글',
        userId: seller.id,
        status: 'ON_SALE',
        items: [
          {
            type: 'ACCESSORY',
            infoId: null,
            listingImageId: image.id,
            accessoryInfo: { name: '플레이매트' },
            detail: 'd',
            condition: 'c',
            quantity: 2,
            pricePerUnit: 2000,
          },
        ],
        images: [image.id],
      })
      .expect(201);

    const listingId = res.body.id;

    const listing = await prisma.listing.findUnique({
      where: { id: listingId },
      include: {
        items: { include: { itemInfo: { include: { accessoryInfo: true } } } },
      },
    });

    expect(listing?.items.length).toBe(1);
    expect(listing?.items[0].itemInfo?.accessoryInfo?.name).toBe('플레이매트');
  });

  it('기존 infoId가 있으면 새 ItemInfo 생성 없이 ListingItem만 연결', async () => {
    const seller = await prisma.user.create({ data: { nickname: 'seller3' } });

    // 기존 ItemInfo를 미리 만들어둠(예: ACCESSORY)
    const itemInfo = await prisma.itemInfo.create({
      data: {
        type: 'ACCESSORY',
        accessoryInfo: { create: { name: '기존악세' } },
      },
      select: { id: true },
    });

    const res = await request(app.getHttpServer())
      .post('/listings')
      .send({
        title: '기존 infoId 사용',
        userId: seller.id,
        status: 'ON_SALE',
        items: [
          {
            type: 'ACCESSORY',
            infoId: itemInfo.id, // 기존 값
            listingImageId: null,
            detail: 'd',
            condition: 'c',
            quantity: 1,
            pricePerUnit: 100,
          },
        ],
        images: [],
      })
      .expect(201);

    const listingId = res.body.id;

    // ItemInfo 개수가 늘지 않았는지(= 새로 만들지 않았는지) 확인
    const itemInfoCount = await prisma.itemInfo.count();
    expect(itemInfoCount).toBe(1);

    const listing = await prisma.listing.findUnique({
      where: { id: listingId },
      include: { items: true },
    });
    expect(listing?.items[0].infoId).toBe(itemInfo.id);
  });

  it('images가 listingId=null이면 updateMany로 listing에 연결된다', async () => {
    const seller = await prisma.user.create({ data: { nickname: 'seller4' } });

    // listingId=null 상태의 이미지 2개 준비
    const img1 = await prisma.listingImage.create({
      data: { order: 0, imageUrl: '' },
    });
    const img2 = await prisma.listingImage.create({
      data: { order: 1, imageUrl: '' },
    });

    const res = await request(app.getHttpServer())
      .post('/listings')
      .send({
        title: '이미지 연결',
        userId: seller.id,
        status: 'ON_SALE',
        items: [
          {
            type: 'ACCESSORY',
            infoId: null,
            accessoryInfo: { name: '매트' },
            detail: 'd',
            condition: 'c',
            quantity: 1,
            pricePerUnit: 1000,
            listingImageId: null,
          },
        ],
        images: [
          { id: img1.id, order: 0 },
          { id: img2.id, order: 1 },
        ],
      })
      .expect(201);

    const listingId = res.body.id;

    const linked = await prisma.listingImage.findMany({
      where: { id: { in: [img1.id, img2.id] } },
      select: { id: true, listingId: true },
    });

    expect(linked.every((x) => x.listingId === listingId)).toBe(true);
  });
});
