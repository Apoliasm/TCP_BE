// src/listings/listings.service.ts
import { Injectable, NotFoundException } from '@nestjs/common';
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
    //1. listing 생성
    const listing = await this.prisma.listing.create({
      data: {
        title: dto.title,
        sellerId: dto.sellerId,
        status: dto.status, // 안 들어오면 Prisma가 default(ON_SALE) 적용
      },
    });

    //2. listingitems 생성
    const items = await this.listingItem.createForListing(
      listing.id,
      dto.items,
    );
    //3.listingItems를 listing에 추가하기
    return this.prisma.listing.findUnique({
      where: { id: listing.id },
      include: {
        items: {
          include: {
            itemInfo: {
              include: {
                cardInfo: { include: { cardName: true, candidate: true } },
                accessoryInfo: true,
              },
            },
          },
        },
      },
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
        items: true,
      },
    });

    if (!listing) throw new NotFoundException('Listing not found');
    return listing;
  }
}
