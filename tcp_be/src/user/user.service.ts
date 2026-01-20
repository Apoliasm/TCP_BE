import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/database/prisma.service';
import { ListingSummaryResponseDto } from '../listings/dto/listing.dto';
import { Prisma } from '@prisma/client';
import { ListingsService } from 'src/listings/listings.service';

@Injectable()
export class UserService {
  constructor(private readonly prisma: PrismaService, private readonly listing: ListingsService) {}

  async getUserListings(userId: number): Promise<ListingSummaryResponseDto[]> {
    return this.listing.getListingItemSummary(undefined, userId);
  }

  async getUserSubscribedItems(userId: number) {
    return this.prisma.item.findMany({
      where:{
        subscribedUsers: {
          some: {
            id: userId,
          },
          
        },
      },
    });
  }
}
