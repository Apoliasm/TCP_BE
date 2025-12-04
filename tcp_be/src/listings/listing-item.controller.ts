import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Post,
} from '@nestjs/common';
import { ListingItemsService } from './listings-items.service';
import { CreateListingItemDto } from './dto/listing-item.dto';
import { ApiBody } from '@nestjs/swagger';

@Controller('listings')
export class ListingItemsController {
  constructor(private readonly listingItemsService: ListingItemsService) {}

  /**
   * 특정 listing에 대한 ListingItem들을 한 번에 생성
   *
   * POST /listings/:listingId/items
   *
   * body 예시: CreateListingItemDto[]
   */
  @Post(':listingId/items')
  @ApiBody({ type: [CreateListingItemDto] })
  async createForListing(
    @Param('listingId', ParseIntPipe) listingId: number,
    @Body() items: CreateListingItemDto[],
  ) {
    // body 내부에 listingId가 들어있다면, param 기준으로 덮어쓰거나 검증할 수도 있음.
    // 지금은 service에서 listingId만 신뢰하는 방식으로 사용.
    return this.listingItemsService.createForListing(listingId, items);
  }

  /**
   * 특정 listing에 연결된 ListingItem 목록 조회
   *
   * GET /listings/:listingId/items
   */
  @Get(':listingId/items')
  async findByListing(@Param('listingId', ParseIntPipe) listingId: number) {
    return this.listingItemsService.findByListing(listingId);
  }

  /**
   * 개별 ListingItem 조회
   *
   * GET /listings/items/:id
   */
  @Get('items/:id')
  async findOne(@Param('id', ParseIntPipe) id: number) {
    return this.listingItemsService.findOne(id);
  }

  /**
   * 특정 listing에 연결된 ListingItem들을 한 번에 삭제
   *
   * DELETE /listings/:listingId/items
   */
  @Delete(':listingId/items')
  async removeByListing(@Param('listingId', ParseIntPipe) listingId: number) {
    await this.listingItemsService.removeByListing(listingId);
    return { success: true };
  }
}
