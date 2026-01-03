import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsArray,
  IsEnum,
  IsInt,
  IsOptional,
  IsString,
  ValidateNested,
} from 'class-validator';
import { ListingStatus } from '@prisma/client';
import { CreateItemDto } from './listing-item.dto';
import {
  CreateListingImageDto,
  ListingImageResponseDto,
} from './listing-image.dto';

export class CreateListingDto {
  @ApiProperty({ description: '판매자(User) id', example: 1 })
  @IsInt()
  userId: number;

  @ApiProperty({
    description: '게시글 제목',
    example: '블루아이즈 시크릿 팝니다',
  })
  @IsString()
  title: string;

  @ApiPropertyOptional({
    description: '본문(대충 몇 줄)',
    example: '직거래 선호 / 네고X',
  })
  @IsOptional()
  @IsString()
  memo?: string;

  @ApiPropertyOptional({
    description: '판매 상태',
    enum: ListingStatus,
    default: ListingStatus.ON_SALE,
  })
  @IsOptional()
  @IsEnum(ListingStatus)
  status?: ListingStatus;

  @ApiPropertyOptional({
    description: '이미지 목록',
    type: [ListingImageResponseDto],
  })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ListingImageResponseDto)
  images?: ListingImageResponseDto[];

  @ApiPropertyOptional({
    description: '아이템 목록(선택)',
    type: [CreateItemDto],
  })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateItemDto)
  items?: CreateItemDto[];
}

export class ListingSummaryResponseDto {
  @ApiProperty({ type: 'number' })
  id: number;

  @ApiProperty({ type: 'string' })
  title: string;

  @ApiProperty({ type: 'number' })
  userId: number;

  @ApiProperty({ type: 'string' })
  useNickName: string;

  @ApiProperty({ enum: ListingStatus })
  status: ListingStatus;

  @ApiProperty({ type: Date })
  createdAt: Date;

  @ApiProperty({ type: Date })
  updatedAt: Date;

  @ApiProperty({ type: 'string' })
  thumbnailURL: string;
}

export class ListingResponseDto extends CreateListingDto {}
