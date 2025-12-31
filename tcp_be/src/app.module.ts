import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ListingsModule } from './listings/listings.module';
import { PrismaModule } from './database/prisma.module';
import { ListingImagesModule } from './listings/listing-imgae.module';

@Module({
  imports: [PrismaModule, ListingsModule, ListingImagesModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
