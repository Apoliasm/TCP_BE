import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsInt, IsNumber, IsOptional, IsString, Min } from 'class-validator';

export class UploadImageDto {
  @Type(() => Number)
  @ApiPropertyOptional({ description: '이미지 정렬 순서 (대표=0)' })
  @IsInt()
  @Min(0)
  order: number;
}
export class CreateListingImageDto extends UploadImageDto {
  @ApiProperty({ description: '이미지 URL' })
  @IsString()
  url: string;
}

export class ListingImageResponseDto extends UploadImageDto {
  @Type(() => Number)
  @IsInt()
  @ApiProperty({ description: '이미지 id' })
  id: number;
}
