// src/listings/listings.service.ts
import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../database/prisma.service';
import { CreateListingDto } from './dto/create-listing.dto';

@Injectable()
export class ListingsService {
  constructor(private readonly prisma: PrismaService) {}

  create(dto: CreateListingDto) {
    return this.prisma.listing.create({
      data: {
        title: dto.title,
        sellerId: dto.sellerId,
        status: dto.status, // 안 들어오면 Prisma가 default(ON_SALE) 적용

        items: {
          create: dto.items.map((item) => ({
            type: item.type,
            cardInfoId: item.cardInfoId,
            detail: item.detail,
            condition: item.condition,
            quantity: item.quantity,
            pricePerUnit: item.pricePerUnit,
          })),
        },
      },
      select: {
        title: true,
        sellerId: true,
        status: true,
        items: true,
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
        items: {
          select: { id: true },
        },
      },
    });

    if (!listing) throw new NotFoundException('Listing not found');
    return listing;
  }
}
