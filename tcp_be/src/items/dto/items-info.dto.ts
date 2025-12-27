// src/cards/dto/create-card-info.dto.ts
import { IsEnum, IsInt, IsString, IsOptional, IsIn } from 'class-validator';
import { CardNation, ListingItemType, Rarity } from '@prisma/client';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { CreateCardCandidatesDto } from 'src/cards/dto/card-name.dto';
import { Type } from 'class-transformer';

export class CreateCardInfoDto {
  @ApiPropertyOptional({
    description:
      '이미 존재하는 CardName ID, cardnameid, candidateid 둘중 하나만 있어도됨',
    example: 1,
  })
  @IsOptional()
  @IsInt()
  cardNameId?: number;

  @ApiPropertyOptional({
    description:
      '후보군 카드의 id, cardnameid, candidateid 둘중 하나만 있어도됨',
    example: 1,
  })
  @IsOptional()
  @IsInt()
  candidateId?: number;

  @ApiPropertyOptional({
    type: CreateCardCandidatesDto,
  })
  @IsOptional()
  @Type(() => CreateCardCandidatesDto)
  candidateInfo?: CreateCardCandidatesDto;

  @ApiPropertyOptional({
    description: '카드 번호',
    example: 'DUAD-KR049',
  })
  @IsOptional()
  @IsString()
  cardCode?: string;

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

export class CreateAccessoryInfoDto {
  @ApiProperty({
    description: '악세사리 이름',
    example: '흑마녀 디아벨스타 프로텍터',
  })
  @IsString()
  name: string;
}

export class ItemInfoResponseDto {
  @IsInt()
  id: number;

  @IsEnum(ListingItemType)
  type: ListingItemType;

  cardInfo?: CardInfoResponseDto;

  accessoryInfo?: AccessoryInfoResponseDto;
}

export class CardInfoResponseDto {
  @IsInt()
  itemInfoId: number;

  @IsOptional()
  @IsInt()
  cardNameId?: number;

  @IsOptional()
  @IsInt()
  candidateId?: number;

  @IsString()
  cardCode: string;

  //optional을 넣어서 들어와도 안들어와도 되는 dto로 차별점
  @IsOptional()
  @IsEnum(CardNation)
  nation?: CardNation;

  @IsEnum(Rarity)
  @IsOptional()
  rarity?: Rarity;
}

export class AccessoryInfoResponseDto {
  @IsInt()
  id: number;

  @IsString()
  name: string;
}

export class SearchQueryDto {
  @IsOptional()
  @IsString()
  @ApiPropertyOptional()
  nameQuery: string;

  @IsOptional()
  @IsString()
  @ApiPropertyOptional()
  codeQuery: string;
}
