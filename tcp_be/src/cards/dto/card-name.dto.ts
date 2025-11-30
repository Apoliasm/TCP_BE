import { IsString, Length } from 'class-validator';

export class CreateCardNameDto {
  @IsString()
  @Length(1, 100)
  name: string;
}

export class CardNameResponseDto {
  id: number;
  name: string;
}
