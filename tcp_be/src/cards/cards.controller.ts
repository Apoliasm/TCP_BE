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
import {
  CreateCardNameDto,
  ResponseCardCandidateDto,
} from './dto/card-name.dto';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { ReponseCardNameDto } from './dto/card-name.dto';
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

  // 🔹 CardName 하나 조회 (id 기준)
  @ApiResponse({
    type: ReponseCardNameDto,
  })
  @Get('names/:id')
  getCardNameById(@Param('id', ParseIntPipe) id: number) {
    return this.cardService.getCardNameById(id);
  }

  //CardCandidate 하나 조회
  @ApiResponse({
    type: ResponseCardCandidateDto,
  })
  @Get('candidates/:id')
  getCardCandidateById(@Param('id', ParseIntPipe) id: number) {
    return this.cardService.getCardCandidateById(id);
  }

  // 🔹 CardInfo 검색 (cardCode / nation / rarity 등으로)
  // 예: GET /cards/infos?cardCode=XXXX
}
