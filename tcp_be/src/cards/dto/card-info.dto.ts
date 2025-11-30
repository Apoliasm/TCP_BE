// src/cards/dto/create-card-info.dto.ts
import { IsEnum, IsInt, IsString, IsOptional } from 'class-validator';
import { CardNation, Rarity } from '@prisma/client';

export class CreateCardInfoDto {
  @IsInt()
  cardNameId: number; // 이미 존재하는 CardName의 id
  @IsString()
  cardCode: string;
  @IsEnum(CardNation)
  nation: CardNation;

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
