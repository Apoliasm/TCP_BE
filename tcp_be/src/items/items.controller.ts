// src/items/items.controller.ts
import {
  Body,
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Post,
  Query,
} from '@nestjs/common';
import { ItemsService } from './items.service';
import {
  CreateCardInfoDto,
  CreateAccessoryInfoDto,
  ItemInfoResponseDto,
  CardInfoResponseDto,
} from 'src/items/dto/items-info.dto';
import { ApiQuery, ApiResponse } from '@nestjs/swagger';

@Controller('items')
export class ItemsController {
  constructor(private readonly itemsService: ItemsService) {}

  /**
   * 카드용 ItemInfo 생성 또는 재사용
   * - cardCode(+기타 정보)로 기존 CardInfo가 있으면 해당 ItemInfo 반환
   * - 없으면 ItemInfo + CardInfo 새로 만들고 반환
   *
   * POST /items/info/card
   */
  @Post('info/card')
  createCardItemInfo(@Body() dto: CreateCardInfoDto) {
    return this.itemsService.createItemInfo(dto);
  }

  /**
   * 악세서리용 ItemInfo 생성 또는 재사용
   * - name으로 기존 AccessoryInfo가 있으면 해당 ItemInfo 반환
   * - 없으면 ItemInfo + AccessoryInfo 새로 만들고 반환
   *
   * POST /items/info/accessory
   */
  @Post('info/accessory')
  createAccessoryItemInfo(@Body() dto: CreateAccessoryInfoDto) {
    return this.itemsService.createItemInfo(dto);
  }

  /**
   * (옵션) ItemInfo 단일 조회
   * GET /items/info/:id
   */
  @ApiResponse({
    type: ItemInfoResponseDto,
  })
  @Get('info/:id')
  findItemInfo(@Param('id', ParseIntPipe) id: number) {
    return this.itemsService.findItemInfo(id);
  }

  @ApiQuery({
    name: 'nameQuery',
    required: true,
    type: String,
    description: '검색할 카드 이름',
  })
  @ApiResponse({
    type: CardInfoResponseDto,
    isArray: true,
  })
  @Get('info')
  searchItem(@Query('nameQuery') nameQuery: string) {
    return this.itemsService.searchItemInfo(nameQuery);
  }
}
