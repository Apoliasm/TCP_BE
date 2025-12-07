// listing-images/dto/listing-image-response.dto.ts
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsInt, IsOptional } from 'class-validator';
import { ListingItemResponseDto } from './listing-item.dto';
import { Type } from 'class-transformer';
export class ListingImageResponseDto {
  @IsInt()
  @ApiProperty()
  id: number;

  @IsOptional()
  @IsInt()
  @ApiPropertyOptional()
  order?: number;
}

export class CreateListingImageDto {
  @IsOptional()
  @ApiPropertyOptional()
  @IsInt()
  @Type(() => Number)
  listingId?: number;

  @IsOptional()
  @ApiPropertyOptional()
  @IsInt()
  @Type(() => Number)
  order?: number;
}
