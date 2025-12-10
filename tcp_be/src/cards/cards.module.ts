// src/card/card.module.ts
import { Module } from '@nestjs/common';
import { CardsController } from './cards.controller';
import { CardsService } from './cards.service';
import { PrismaService } from 'src/database/prisma.service';
@Module({
  controllers: [CardsController],
  providers: [CardsService, PrismaService],
  exports: [CardsService], // Listing 등 다른 모듈에서 CardService 쓰고 싶을 수 있으니 export
})
export class CardsModule {}
