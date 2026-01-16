import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsInt, IsOptional, IsString, Min, MinLength } from 'class-validator';

export class ListingItemDto {
  @ApiProperty({ description: '품목명', example: '블루아이즈 시크릿' })
  @IsString()
  name: string;

  @ApiProperty({
    description: '개당 가격 (원)',
    example: 8000,
    minimum: 0,
  })
  @IsInt()
  @Min(0)
  pricePerUnit: number;

  @ApiProperty({
    description: '단위(묶음 단위 등). 예: 1(장), 10(10장 묶음)',
    example: 1,
    minimum: 1,
  })
  @IsInt()
  @Min(1)
  unit: number;

  @ApiPropertyOptional({
    description: '상태/설명 텍스트',
    example: '미개봉 / 생활기스 있음',
  })
  @IsOptional()
  @IsString()
  detailText?: string;

  @ApiPropertyOptional({
    description: '수량',
    example: 1,
    default: 1,
    minimum: 1,
  })
  @IsOptional()
  @IsInt()
  @Min(1)
  quantity?: number = 1;

  @ApiPropertyOptional({
    description: 'item Id',
    type: 'number',
  })
  @IsOptional()
  @IsInt()
  itemId?: number;
}

export class CreateListingItemDto extends ListingItemDto {
  @ApiPropertyOptional({
    description: '이 아이템이 속할 이미지 ID (없으면 기타/미분류)',
    example: 12,
  })
  @IsOptional()
  @IsInt()
  listingImageId?: number;
}

export class ListingItemResponseDto extends ListingItemDto {
  @ApiProperty({
    type: 'number',
  })
  id: number;

  @ApiProperty({
    type: Date,
  })
  createdAt: Date;
  @ApiProperty({
    type: Date,
  })
  updatedAt: Date;
}
