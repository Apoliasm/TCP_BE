import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString } from 'class-validator';

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
