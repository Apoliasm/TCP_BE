import { Controller, Post, Body, Get, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBody, ApiResponse, ApiQuery } from '@nestjs/swagger';
import { OpenAIService } from './openai.service';

class ChatRequestDto {
  messages: Array<{ role: 'system' | 'user' | 'assistant'; content: string }>;
  model?: string;
}

class AskRequestDto {
  question: string;
  systemPrompt?: string;
}

class EmbeddingRequestDto {
  text: string;
  model?: string;
}

@ApiTags('OpenAI')
@Controller('openai')
export class OpenAIController {
  constructor(private readonly openaiService: OpenAIService) {}

  @Get('filterItemName')
  @ApiQuery({ name: 'items', type: [String], required: true, isArray: true })
  async filterItemName(@Query('items') items: string | string[]) {
    //단일 쿼리가 들어오면 쿼리 배열로 변환
    const itemsArray = Array.isArray(items) ? items : [items];
    return this.openaiService.filterItemName(itemsArray);
  }
  // @Get('validate')
  // @ApiOperation({ summary: 'API 키 유효성 검사' })
  // @ApiResponse({ status: 200, description: 'API key validation result' })
  // async validateApiKey() {
  //   const isValid = await this.openaiService.validateApiKey();
  //   return { valid: isValid };
  // }
}