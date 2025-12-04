// src/items/items.module.ts
import { Module } from '@nestjs/common';
import { ItemsController } from './items.controller';
import { ItemsService } from './items.service';
import { PrismaService } from 'src/database/prisma.service';

@Module({
  imports: [],
  controllers: [ItemsController],
  providers: [ItemsService, PrismaService],
  exports: [ItemsService],
})
export class ItemsModule {}
