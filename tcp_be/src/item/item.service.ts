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

}
