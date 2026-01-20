import {
  Body,
  Controller,
  Delete,
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
import {
  ApiBody,
  ApiOkResponse,
  ApiOperation,
  ApiParam,
  ApiQuery,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { ItemSearchQuery } from 'src/item/dto/item.dto';

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


  @Delete(':id/delete')
  @ApiOperation({ summary: 'Listing 완전 삭제 (Hard Delete - DB에서 실제 삭제, 주의: 관련 데이터도 함께 삭제됨)' })
  @ApiParam({ name: 'id', description: 'Listing ID' })
  @ApiQuery({ name: 'userId', required: false, description: '사용자 ID (권한 확인용)' })
  @ApiOkResponse({ type: ListingResponseDto })
  @ApiResponse({ status: 404, description: 'Listing not found' })
  @ApiResponse({ status: 403, description: 'Permission denied' })
  async hardRemove(
    @Param('id', ParseIntPipe) id: number,
    @Query('userId') userId?: string,
  ) {
    const userIdNum = userId ? parseInt(userId, 10) : undefined;
    return this.listingsService.hardRemove(id, userIdNum);
  }
}
