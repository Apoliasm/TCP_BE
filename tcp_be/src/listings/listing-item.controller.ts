import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Post,
} from '@nestjs/common';
import { ListingItemsService } from './listings-items.service';
import { ApiBody } from '@nestjs/swagger';

@Controller('listings')
export class ListingItemsController {
  constructor(private readonly listingItemsService: ListingItemsService) {}
}
