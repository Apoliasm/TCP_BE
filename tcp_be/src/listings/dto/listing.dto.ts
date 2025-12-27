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
import { ListingItemType, ListingStatus } from '@prisma/client';
import {
  CreateListingItemAccessory,
  CreateListingItemCard,
  CreateListingItemCommon,
  CreateListingItemDto,
  ListingItemResponseDto,
} from 'src/listings/dto/listing-item.dto';
import {
  ApiProperty,
  ApiPropertyOptional,
  getSchemaPath,
} from '@nestjs/swagger';
import { ListingImageResponseDto } from './listing-image.dto';
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

  @IsOptional()
  @ApiProperty({
    description: '판매 품목들',
    oneOf: [
      { $ref: getSchemaPath(CreateListingItemCard) },
      { $ref: getSchemaPath(CreateListingItemAccessory) },
    ],
    isArray: true,
  })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateListingItemCommon, {
    discriminator: {
      property: 'type',
      subTypes: [
        { name: ListingItemType.CARD, value: CreateListingItemCard },
        { name: ListingItemType.ACCESSORY, value: CreateListingItemAccessory },
      ],
    },
  })
  items: CreateListingItemDto[];

  @IsOptional()
  @ValidateNested({ each: true })
  @ApiPropertyOptional({
    type: [ListingImageResponseDto],
  })
  @Type(() => ListingImageResponseDto)
  images: ListingImageResponseDto[];
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

  @ApiProperty({ type: [ListingImageResponseDto] })
  @Type(() => ListingImageResponseDto)
  images: ListingImageResponseDto[];

  // 필요하면 flat 아이템 리스트도:
  // @ApiProperty({ type: [ListingItemResponseDto] })
  // items: ListingItemResponseDto[];
}

export class ListingSummaryResponseDto {
  @ApiProperty({ type: 'number' })
  id: number;

  @ApiProperty({ type: 'string' })
  title: string;

  @ApiProperty({ type: 'number' })
  sellerId: number;

  @ApiProperty({ type: 'string' })
  sellerNickName: string;

  @ApiProperty({ enum: ListingStatus })
  status: ListingStatus;

  @ApiProperty({ type: Date })
  createdAt: Date;

  @ApiProperty({ type: Date })
  updatedAt: Date;

  @ApiProperty({ type: 'string' })
  thumbnailURL: string;
}
