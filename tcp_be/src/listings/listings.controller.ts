import {
  Body,
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Post,
} from '@nestjs/common';
import { ListingsService } from './listings.service';
import {
  CreateListingDto,
  ResponseListingDto,
  ResponseListingSummaryDto,
} from './dto/listing.dto';
import { ApiBody, ApiResponse } from '@nestjs/swagger';

@Controller('listings')
export class ListingsController {
  constructor(private readonly listingsService: ListingsService) {}

  @ApiBody({
    type: CreateListingDto,
  })
  @Post()
  create(@Body() dto: CreateListingDto) {
    // sellerId는 일단 dto로 받고, 나중에는 JWT에서 가져오게 변경하면 됨
    return this.listingsService.create(dto);
  }

  @ApiResponse({
    type: [ResponseListingSummaryDto],
  })
  @Get()
  findAll() {
    return this.listingsService.findAll();
  }

  @ApiResponse({
    type: ResponseListingDto,
  })
  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.listingsService.findOne(id);
  }
}
