import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsInt, IsNumber, IsOptional, IsString, Min } from 'class-validator';

export class CreateListingImageDto {
  @ApiProperty({ description: '이미지 URL' })
  @IsString()
  url: string;

  @ApiPropertyOptional({ description: '이미지 정렬 순서 (대표=0)', default: 0 })
  @IsOptional()
  @IsInt()
  @Min(0)
  order?: number = 0;
}

export class ListingImageResponseDto extends CreateListingImageDto {
  @ApiProperty({ description: '이미지 id' })
  @IsNumber()
  id: number;
}
