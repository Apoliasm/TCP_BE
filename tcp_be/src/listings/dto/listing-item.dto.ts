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
export class CreateListingItemDto {
  //게시글 생성에 호출되는 DTO -> 자동으로 생성되는 listing id를 추가하게 됨
  //api에 listingid 호출이 불필요함으로 제거
  // @ApiProperty({
  //   description: '판매 게시글 id',
  // })
  // @IsInt()
  // listingId: number;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsInt()
  listingImageId?: number;

  @ApiProperty({
    description: '판매 품목 종류 card, acccessory',
    enum: ListingItemType,
  })
  @IsEnum(ListingItemType)
  type: ListingItemType; // 'CARD' | 'ACCESSORY' | 'OTHER'
  // 🔹 type이 CARD일 때만 채우는 필드

  @ApiPropertyOptional({
    description: '이미 존재하는 item을 참조햇을 때',
    type: 'number',
  })
  @IsOptional()
  @IsInt()
  infoId?: number;

  @ApiPropertyOptional({
    description: '카드라면 card정보',
  })
  // 🔹 type이 CARD일 때만 채우는 필드
  @IsOptional()
  @ValidateNested()
  @Type(() => CreateCardInfoDto)
  cardInfo?: CreateCardInfoDto;

  @ApiPropertyOptional({
    description: '악세사리라면 악세사리 정보',
  })
  // 🔹 type이 ACCESSORY일 때만 채우는 필드
  @IsOptional()
  @ValidateNested()
  @Type(() => CreateAccessoryInfoDto)
  accessoryInfo?: CreateAccessoryInfoDto;

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

export class ListingItemResponseDto {
  @ApiProperty()
  @IsInt()
  listingId: number;

  @ApiProperty()
  @IsEnum(ListingItemType)
  type: ListingItemType; // 'CARD' | 'ACCESSORY' | 'OTHER'
  // 🔹 type이 CARD일 때만 채우는 필드

  @ApiPropertyOptional()
  @IsOptional()
  @IsInt()
  infoId?: number;
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
