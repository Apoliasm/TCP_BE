import { ApiProperty } from '@nestjs/swagger';
import { IsString, Length } from 'class-validator';

export class CreateCardNameDto {
  @ApiProperty({
    description: '카드 이름',
    example: '섬도희-제로',
  })
  @IsString()
  @Length(1, 100)
  name: string;
}

export class CardNameResponseDto {
  id: number;
  name: string;
}
