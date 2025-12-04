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
import {
  CreateListingItemDto,
  ListingItemResponseDto,
} from 'src/listings/dto/listing-item.dto';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateListingDto {
  @ApiProperty({
    description: '게시글 제목',
    example: '게시글 제목',
  })
  @IsString()
  title: string;

  // 인증 붙기 전까지는 sellerId를 바디로 받을 수도 있고,
  // 나중에는 JWT에서 꺼내 쓰고 여기서 제거해도 됨
  @ApiProperty({
    description: '판매자 id',
    example: 1,
  })
  @IsInt()
  sellerId: number;

  @ApiPropertyOptional({
    description: '판매 상태',
    enum: ListingStatus,
  })
  @IsOptional()
  @IsEnum(ListingStatus)
  status?: ListingStatus; // 안 보내면 ON_SALE 기본값

  @ApiProperty({
    type: [CreateListingItemDto],
    description: '판매 품목들',
  })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateListingItemDto)
  items: CreateListingItemDto[];
}

export class ListingResponseDto {
  @ApiProperty()
  id: number;

  @ApiProperty()
  title: string;

  @ApiProperty()
  sellerId: number;

  @ApiProperty({ enum: ListingStatus })
  status: ListingStatus;

  @ApiProperty()
  createdAt: Date;

  @ApiProperty()
  updatedAt: Date;

  @ApiProperty({ type: [ListingItemResponseDto] })
  @Type(() => ListingItemResponseDto)
  items: ListingItemResponseDto[];
}
