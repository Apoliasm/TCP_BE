// src/listings/dto/create-listing-item.dto.ts
import {
  IsEnum,
  IsInt,
  IsOptional,
  IsString,
  Min,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';
import { ItemInfo, ListingItemType } from '@prisma/client';
import {
  CreateCardInfoDto,
  CreateAccessoryInfoDto,
} from 'src/items/dto/items-info.dto';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
export class CreateListingItemCommon {
  @ApiProperty({ required: false })
  @IsOptional()
  @IsInt()
  listingImageId?: number;

  @ApiPropertyOptional({
    description: '이미 존재하는 item을 참조햇을 때',
    type: 'number',
  })
  @IsOptional()
  @IsInt()
  infoId?: number;

  @ApiPropertyOptional({
    description: '품목에 대한 자세한 설명',
  })
  @IsOptional()
  @IsString()
  detail?: string;

  @ApiPropertyOptional({
    description: '상태에 대한 설명',
  })
  @IsOptional()
  @IsString()
  condition?: string;

  @ApiProperty({
    description: '갯수에 대한 설명',
  })
  @IsInt()
  @Min(1)
  quantity: number;

  @ApiProperty({
    description: '한개당 가격',
  })
  @IsInt()
  @Min(0)
  pricePerUnit: number;
}

export class CreateListingItemCard extends CreateListingItemCommon {
  @ApiProperty({
    description: '판매 품목 종류 card, acccessory',
    enum: ListingItemType,
  })
  @IsEnum(ListingItemType)
  type: typeof ListingItemType.CARD;

  @ApiPropertyOptional({
    description: '카드라면 card정보',
  })
  // 🔹 type이 CARD일 때만 채우는 필드
  @ValidateNested()
  @Type(() => CreateCardInfoDto)
  cardInfo: CreateCardInfoDto;
}

export class CreateListingItemAccessory extends CreateListingItemCommon {
  @ApiProperty({
    description: '판매 품목 종류 card, acccessory',
    enum: ListingItemType,
  })
  @IsEnum(ListingItemType)
  type: typeof ListingItemType.ACCESSORY;

  @ApiPropertyOptional({
    description: '악세사리라면 악세사리 정보',
  })
  // 🔹 type이 ACCESSORY일 때만 채우는 필드
  @ValidateNested()
  @Type(() => CreateAccessoryInfoDto)
  accessoryInfo: CreateAccessoryInfoDto;
}

export type CreateListingItemDto =
  | CreateListingItemCard
  | CreateListingItemAccessory;

export class ListingItemResponseDto {
  @ApiProperty()
  @IsInt()
  listingId: number;

  @ApiProperty()
  @IsEnum(ListingItemType)
  type: ListingItemType; // 'CARD' | 'ACCESSORY' | 'OTHER'
  // 🔹 type이 CARD일 때만 채우는 필드

  // 🔹 type이 CARD일 때만 채우는 필드
  @ApiPropertyOptional()
  @IsOptional()
  @ValidateNested()
  @Type(() => CreateCardInfoDto)
  cardInfo?: CreateCardInfoDto;

  // 🔹 type이 ACCESSORY일 때만 채우는 필드
  @ApiPropertyOptional()
  @IsOptional()
  @ValidateNested()
  @Type(() => CreateAccessoryInfoDto)
  accessoryInfo?: CreateAccessoryInfoDto;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  detail?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  condition?: string;

  @ApiProperty()
  @IsInt()
  @Min(1)
  quantity: number;

  @ApiProperty()
  @IsInt()
  @Min(0)
  pricePerUnit: number;
}
