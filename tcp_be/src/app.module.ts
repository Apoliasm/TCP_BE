import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ListingsModule } from './listings/listings.module';
import { PrismaModule } from './database/prisma.module';
import { CardsModule } from './cards/cards.module';
import { ItemsModule } from './items/items.module';
import { ListingImagesModule } from './listings/listing-imgae.module';

@Module({
  imports: [
    PrismaModule,
    ListingsModule,
    CardsModule,
    ItemsModule,
    ListingImagesModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
