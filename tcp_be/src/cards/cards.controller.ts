// src/card/card.controller.ts
import {
  Body,
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Post,
  Query,
} from '@nestjs/common';
import { CardsService } from './cards.service';
import { CreateCardNameDto } from './dto/card-name.dto';
import { CreateCardInfoDto, FindCardInfoDto } from './dto/card-info.dto';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
@Controller('cards')
export class CardsController {
  constructor(private readonly cardService: CardsService) {}

  // 🔹 CardName 생성 (카드 이름만 등록)
  @Post('names')
  @ApiOperation({ summary: '카드 이름 등록 or 조회 (upsert)' })
  @ApiResponse({ status: 201, description: '카드 이름 생성 또는 기존 값 반환' })
  createCardName(@Body() dto: CreateCardNameDto) {
    return this.cardService.createCardName(dto);
  }

  // 🔹 CardInfo 생성 (카드 상세 정보 등록)
  @ApiOperation({
    summary: '카드 상세 정보 등록 or 조회',
  })
  @Post('infos')
  createCardInfo(@Body() dto: CreateCardInfoDto) {
    return this.cardService.createCardInfo(dto);
  }

  // 🔹 CardName 하나 조회 (id 기준)
  @Get('names/:id')
  getCardName(@Param('id', ParseIntPipe) id: number) {
    return this.cardService.getCardNameById(id);
  }

  // 🔹 CardInfo 하나 조회 (id 기준)
  @Get('infos/:id')
  getCardInfo(@Param('id', ParseIntPipe) id: number) {
    return this.cardService.getCardInfoById(id);
  }

  // 🔹 CardInfo 검색 (cardCode / nation / rarity 등으로)
  // 예: GET /cards/infos?cardCode=XXXX
  @Get('infos')
  findCardInfos(@Query() query: FindCardInfoDto) {
    return this.cardService.findCardInfos(query);
  }
}
