// listing-images/listing-images.module.ts
import { Module } from '@nestjs/common';
import { ListingImagesController } from './listing-image.controller';
import { ListingImagesService } from './listing-image.service';
import { PrismaService } from 'src/database/prisma.service';
@Module({
  controllers: [ListingImagesController],
  providers: [ListingImagesService, PrismaService],
  exports: [ListingImagesService],
})
export class ListingImagesModule {}
