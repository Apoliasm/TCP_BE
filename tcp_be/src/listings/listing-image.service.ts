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

  async create(
    dto: CreateListingImageDto,
    imageUrl: string,
  ): Promise<ListingImageResponseDto> {
    const image = await this.prisma.listingImage.create({
      data: {
        imageUrl: imageUrl,
        order: dto.order ?? null,
      },
      include: {
        items: true,
      },
    });

    return image as unknown as ListingImageResponseDto;
  }

  async findByListing(listingId: number): Promise<ListingImageResponseDto[]> {
    const images = await this.prisma.listingImage.findMany({
      where: { listingId },
      orderBy: { order: 'asc' },
      include: {
        items: true,
      },
    });

    return images as unknown as ListingImageResponseDto[];
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
