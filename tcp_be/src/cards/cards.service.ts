import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/database/prisma.service';
import { CardNation, Rarity } from '@prisma/client';
import { CreateCardNameDto } from './dto/card-name.dto';
import { CreateCardInfoDto, FindCardInfoDto } from './dto/card-info.dto';
// cards.service.ts
@Injectable()
export class CardsService {
  constructor(private readonly prisma: PrismaService) {}

  // async findOrCreateCardName(dto: CreateCardNameDto) {
  //   return await this.prisma.cardName.upsert({
  //     where: {
  //       name: dto.name,
  //     },
  //     update: {},
  //     create: {
  //       name: dto.name,
  //     },
  //     select: {
  //       id: true,
  //       name: false,
  //       cardInfos: false,
  //     },
  //   });
  // }

  // async findOrCreateCardInfo(dto: FindCardInfoDto) {
  //   let found = await this.prisma.cardInfo.findUnique({
  //     where: {
  //       cardCode: dto.cardCode,
  //       rarity: dto.rarity,
  //     },
  //   });
  //   if (found) return;
  //   return await this.prisma.cardInfo.create({
  //     data: {
  //       cardCode: dto.cardCode,
  //       cardNameId: dto.cardNameId,
  //       nation: dto.nation ? dto.nation : 'KR',
  //       rarity: dto.rarity ? dto.rarity : ,
  //     },
  //   });
  // }

  async createCardName(dto: CreateCardNameDto) {
    return this.prisma.cardName.upsert({
      where: { name: dto.name },
      update: {},
      create: { name: dto.name },
    });
  }

  async createCardInfo(dto: CreateCardInfoDto) {
    return this.prisma.cardInfo.upsert({
      where: { cardCode: dto.cardCode },
      update: {
        // 필요 시 업데이트 정책
        nation: dto.nation,
        rarity: dto.rarity,
      },
      create: {
        cardCode: dto.cardCode,
        nation: dto.nation,
        rarity: dto.rarity,
        cardNameId: dto.cardNameId,
      },
    });
  }

  async getCardNameById(id: number) {
    return this.prisma.cardName.findUnique({
      where: { id },
    });
  }

  async getCardInfoById(id: number) {
    return this.prisma.cardInfo.findUnique({
      where: { id },
    });
  }

  async findCardInfos(query: FindCardInfoDto) {
    return this.prisma.cardInfo.findMany({
      where: {
        cardCode: query.cardCode,
        cardNameId: query.cardNameId,
        nation: query.nation,
        rarity: query.rarity,
      },
    });
  }
}
