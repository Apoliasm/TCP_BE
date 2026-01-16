import { Body, Controller, Get, Post, Query } from '@nestjs/common';
import {
  CreateItemDto,
  ItemResponseDto,
  ItemSearchQuery,
} from './dto/item.dto';
import { ApiBody, ApiOkResponse, ApiQuery } from '@nestjs/swagger';
import { PrismaService } from 'src/database/prisma.service';
import { ItemService } from './item.service';

@Controller('items')
export class ItemController {
  constructor(private readonly itemService: ItemService) {}

  @ApiBody({
    type: CreateItemDto,
    description: '아이템 생성',
  })
  @Post()
  async create(@Body() dto: CreateItemDto) {
    // userId는 일단 dto로 받고, 나중에는 JWT에서 가져오게 변경하면 됨
    return this.itemService.createItem(dto);
  }

  @Get()
  @ApiOkResponse({
    type: [ItemResponseDto],
  })
  async findItemByName(@Query() dto: ItemSearchQuery) {
    return this.itemService.findItemByName(dto);
  }
}
