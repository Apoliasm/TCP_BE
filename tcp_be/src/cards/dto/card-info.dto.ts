// src/cards/dto/create-card-info.dto.ts
import { IsEnum, IsInt, IsString, IsOptional } from 'class-validator';
import { CardNation, Rarity } from '@prisma/client';
import { ApiProperty } from '@nestjs/swagger';

export class CreateCardInfoDto {
  @ApiProperty({
    description: '이미 존재하는 CardName의 ID',
    example: 1,
  })
  @IsInt()
  cardNameId: number;

  @ApiProperty({
    description: '카드 번호',
    example: 'DUAD-KR049',
  })
  @IsString()
  cardCode: string;

  @ApiProperty({
    description: '카드 국가 정보 (enum: KR / JP / EN)',
    enum: CardNation,
    example: CardNation.KR,
  })
  @IsEnum(CardNation)
  nation: CardNation;

  @ApiProperty({
    description: '희귀도 (예: R, SR, UR 등)',
    enum: Rarity,
    example: Rarity.UL,
  })
  @IsEnum(Rarity)
  rarity: Rarity;
}

export class FindCardInfoDto {
  @IsString()
  cardCode: string;

  @IsInt()
  cardNameId: number;

  //optional을 넣어서 들어와도 안들어와도 되는 dto로 차별점
  @IsOptional()
  @IsEnum(CardNation)
  nation?: CardNation;

  @IsEnum(Rarity)
  @IsOptional()
  rarity?: Rarity;
}
