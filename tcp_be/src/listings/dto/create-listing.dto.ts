// src/listings/dto/create-listing.dto.ts
import {
  IsArray,
  IsEnum,
  IsInt,
  IsOptional,
  IsString,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';
import { ListingStatus } from '@prisma/client';
import { CreateListingItemDto } from './create-listing-item.dto';

export class CreateListingDto {
  @IsString()
  title: string;

  // 인증 붙기 전까지는 sellerId를 바디로 받을 수도 있고,
  // 나중에는 JWT에서 꺼내 쓰고 여기서 제거해도 됨
  @IsInt()
  sellerId: number;

  @IsOptional()
  @IsEnum(ListingStatus)
  status?: ListingStatus; // 안 보내면 ON_SALE 기본값

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateListingItemDto)
  items: CreateListingItemDto[];
}
