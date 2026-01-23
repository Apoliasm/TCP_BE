import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/database/prisma.service';
import { ListingSummaryResponseDto } from '../listings/dto/listing.dto';
import { Prisma } from '@prisma/client';
import { ListingsService } from 'src/listings/listings.service';
import { ApiOperation, ApiResponse } from '@nestjs/swagger';
import { ItemResponseDto } from 'src/item/dto/item.dto';

@Injectable()
export class UserService {
  constructor(private readonly prisma: PrismaService, private readonly listing: ListingsService) {}

  @ApiOperation({ summary: '유저의 게시글 목록 조회' })
  @ApiResponse({
    status: 200,
    description: '유저의 게시글 목록 조회 성공',
    type: [ListingSummaryResponseDto],
  })
  async getUserListings(userId: number): Promise<ListingSummaryResponseDto[]> {
    return this.listing.getListingItemSummary(undefined, userId);
  }

  @ApiOperation({ summary: '유저의 구독 아이템 목록 조회' })
  @ApiResponse({
    status: 200,
    description: '유저의 구독 아이템 목록 조회 성공',
    type: [ItemResponseDto],
  })
  async getUserSubscribedItems(userId: number) : Promise<ItemResponseDto[]> {
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
