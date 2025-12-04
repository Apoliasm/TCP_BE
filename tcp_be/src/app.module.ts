import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ListingsModule } from './listings/listings.module';
import { PrismaModule } from './database/prisma.module';
import { CardModule } from './cards/cards.module';
import { ItemsModule } from './items/items.module';

@Module({
  imports: [PrismaModule, ListingsModule, CardModule, ItemsModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
