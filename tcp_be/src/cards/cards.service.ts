import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/database/prisma.service';
import { CreateCardNameDto } from './dto/card-name.dto';

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

  async getCardNameById(id: number) {
    return this.prisma.cardName.findUnique({
      where: { id },
    });
  }

  async getCardCandidateById(id: number) {
    return this.prisma.cardCandidates.findUnique({
      where: { id },
    });
  }
}
