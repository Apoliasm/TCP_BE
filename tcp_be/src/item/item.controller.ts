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

}
