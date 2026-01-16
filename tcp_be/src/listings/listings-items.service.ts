import { Injectable, BadRequestException } from '@nestjs/common';
import { PrismaService } from 'src/database/prisma.service';
import { CreateItemDto, ItemResponseDto } from './dto/listing-item.dto';
import { Prisma } from '@prisma/client';

@Injectable()
export class ListingItemsService {
  constructor(private readonly prisma: PrismaService) {}

  async createListingItem(
    listingId: number,
    items: CreateItemDto[],
    tx?: Prisma.TransactionClient,
  ) {
    let client: Prisma.TransactionClient | PrismaService = this.prisma;
    if (tx) client = tx;
    if (!items?.length)
      throw new BadRequestException('생성할 ListingItem이 없습니다.');

    const itemToCreate: Prisma.ListingItemCreateManyInput[] = [];
    for (const item of items) {
      itemToCreate.push({ ...item, listingId });
    }
    const createManyIds = await client.listingItem.createManyAndReturn({
      data: itemToCreate,
      select: { id: true },
    });

    return createManyIds;
  }
}
