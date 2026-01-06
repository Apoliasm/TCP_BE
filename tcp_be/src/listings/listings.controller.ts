import {
  Body,
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Post,
  Query,
} from '@nestjs/common';
import { ListingsService } from './listings.service';
import {
  CreateListingDto,
  ListingResponseDto,
  ListingSummaryResponseDto,
} from './dto/listing.dto';
import { ApiBody, ApiOkResponse, ApiQuery, ApiResponse } from '@nestjs/swagger';
import { ItemSearchQuery } from './dto/listing-item.dto';

@Controller('listings')
export class ListingsController {
  constructor(private readonly listingsService: ListingsService) {}

  @ApiBody({
    type: CreateListingDto,
  })
  @Post()
  create(@Body() dto: CreateListingDto) {
    // userId는 일단 dto로 받고, 나중에는 JWT에서 가져오게 변경하면 됨
    return this.listingsService.create(dto);
  }

  @ApiResponse({
    type: ListingResponseDto,
  })
  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.listingsService.findOne(id);
  }

  @Get()
  @ApiQuery({ name: 'query', required: false, description: '검색어' })
  @ApiResponse({ type: [ListingSummaryResponseDto] })
  async searchByItemName(
    @Query() query: ItemSearchQuery,
  ): Promise<ListingSummaryResponseDto[]> {
    let keyword = query.query?.trim();
    if (keyword) {
      return this.listingsService.findListingIdsByItemName(keyword);
    }
    return this.listingsService.findAll();
  }
}
