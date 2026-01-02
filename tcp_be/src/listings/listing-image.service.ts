// listing-images/listing-images.service.ts
import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../database/prisma.service';
import {
  CreateListingImageDto,
  ListingImageResponseDto,
} from './dto/listing-image.dto';

@Injectable()
export class ListingImagesService {
  constructor(private readonly prisma: PrismaService) {}

  async create(dto: CreateListingImageDto) {
    const image = await this.prisma.listingImage.create({
      data: {
        ...dto,
      },
      select: {
        id: true,
      },
    });

    return image as ListingImageResponseDto;
  }

  async getById(id: number): Promise<ListingImageResponseDto> {
    const image = await this.prisma.listingImage.findUnique({
      where: { id },
      include: {
        items: true, // 필요시 itemInfo, listingItem 등 더 include 가능
      },
    });

    if (!image) {
      throw new NotFoundException('ListingImage not found');
    }

    return image as unknown as ListingImageResponseDto;
  }
}
