// src/listings/dto/create-listing-item.dto.ts
import { IsEnum, IsInt, IsOptional, IsString, Min } from 'class-validator';
import { ListingItemType } from '@prisma/client';

export class CreateListingItemDto {
  @IsEnum(ListingItemType)
  type: ListingItemType; // 'CARD' | 'ACCESSORY' | 'OTHER'

  @IsInt()
  cardInfoId: number; // 스키마에서 cardInfoId가 Int (nullable 아님) 이라 필수

  @IsOptional()
  @IsString()
  detail?: string;

  @IsOptional()
  @IsString()
  condition?: string;

  @IsInt()
  @Min(1)
  quantity: number;

  @IsInt()
  @Min(0)
  pricePerUnit: number;
}
