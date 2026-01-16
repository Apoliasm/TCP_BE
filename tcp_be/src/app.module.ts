import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ListingsModule } from './listings/listings.module';
import { PrismaModule } from './database/prisma.module';
import { ListingImagesModule } from './listings/listing-imgae.module';
import { ItemModule } from './item/item.module';

@Module({
  imports: [PrismaModule, ListingsModule, ListingImagesModule, ItemModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
