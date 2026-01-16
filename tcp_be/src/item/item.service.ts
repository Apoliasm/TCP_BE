import { PrismaService } from 'src/database/prisma.service';
import {
  CreateItemDto,
  ItemResponseDto,
  ItemSearchQuery,
} from './dto/item.dto';
import { Injectable } from '@nestjs/common';

@Injectable()
export class ItemService {
  constructor(private readonly prisma: PrismaService) {}

  async createItem(dto: CreateItemDto) {
    return this.prisma.item.create({
      data: dto,
    });
  }
  async findItemByName(query: ItemSearchQuery): Promise<ItemResponseDto[]> {
    const queryString = query.query ?? '';

    return this.prisma.item.findMany({
      where: {
        name: {
          contains: queryString,
        },
      },
    });
  }
}
