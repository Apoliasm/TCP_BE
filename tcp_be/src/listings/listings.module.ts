import { Module } from '@nestjs/common';
import { ListingsService } from './listings.service';
import { ListingsController } from './listings.controller';
import { ListingItemsService } from './listings-items.service'; // 파일 이름 확인!
// listing-items.controller.ts를 만들었다면:
import { ListingItemsController } from './listing-item.controller';

import { PrismaService } from 'src/database/prisma.service';
import { PrismaModule } from 'src/database/prisma.module';
import { OpenAIModule } from 'src/openai/openai.module';

@Module({
  imports: [OpenAIModule], // ItemsService 주입용
  controllers: [ListingsController, ListingItemsController],
  providers: [ListingsService, ListingItemsService, PrismaService],
  exports: [ListingsService, ListingItemsService],
})
export class ListingsModule {}
