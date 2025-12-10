import { ApiProperty } from '@nestjs/swagger';
import { IsInt, IsString, Length } from 'class-validator';

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
  @ApiProperty({})
  @IsInt()
  id: number;
  @IsString()
  @Length(1, 100)
  name: string;
}

export class CreateCardCandidatesDto {
  @ApiProperty({
    description: '카드 이름',
    example: '섬도희-제로',
  })
  @IsString()
  @Length(1, 100)
  name: string;
}

export class CardCandidateResponseDto {
  @ApiProperty({})
  @IsInt()
  id: number;
  @ApiProperty({
    description: '카드 이름',
    example: '섬도희-제로',
  })
  @IsString()
  @Length(1, 100)
  name: string;
}
