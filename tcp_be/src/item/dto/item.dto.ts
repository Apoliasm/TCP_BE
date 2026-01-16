import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString } from 'class-validator';

export class ItemDto {
  @ApiProperty({
    type: 'string',
  })
  @IsString()
  name: string;
}

export class CreateItemDto extends ItemDto {}

export class ItemResponseDto extends ItemDto {
  @ApiProperty({
    description: 'item id',
    type: 'number',
  })
  id: number;
}
export class ItemSearchQuery {
  @ApiPropertyOptional({
    description: '검색할 아이템 이름(부분 검색)',
    example: '후와로스',
  })
  @IsOptional()
  @IsString()
  query?: string;
}
