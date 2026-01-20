import { Injectable, Logger, Optional } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import axios, { AxiosInstance } from 'axios';
import { 
  FilterResponse, 
  OpenAiRequest, 
  FilterResultItem,
  ChatCompletionResponse, 
  ChatCompletionOptions
} from './type';
import { FILTER_PROMPT, RESPONSE_SCHEMA, OPENAI_CONFIG } from './const';



@Injectable()
export class OpenAIService {
  private readonly logger = new Logger(OpenAIService.name);
  private readonly client: AxiosInstance;
  private readonly apiKey: string;
  private readonly baseURL = 'https://api.openai.com/v1';

  constructor(@Optional() private readonly configService?: ConfigService) {
    this.apiKey = this.configService?.get<string>('OPENAI_API_KEY') 
      || process.env.OPENAI_API_KEY 
      || '';
    
    if (!this.apiKey) {
      this.logger.warn('OPENAI_API_KEY is not set in environment variables');
    }

    this.client = axios.create({
      baseURL: this.baseURL,
      headers: {
        'Authorization': `Bearer ${this.apiKey}`,
        'Content-Type': 'application/json',
      },
    });
  }

  /**
   * ChatGPT API를 사용하여 텍스트 생성
   * @param messages 채팅 메시지 배열
   * @param options OpenAI API 옵션
   * @returns ChatCompletionResponse
   */
  async chatCompletion(
    messages: Array<{ role: 'system' | 'user' | 'assistant'; content: string }>,
    options: ChatCompletionOptions = {}
  ): Promise<ChatCompletionResponse> {
    const {
      model = OPENAI_CONFIG.DEFAULT_MODEL,
      temperature = OPENAI_CONFIG.DEFAULT_TEMPERATURE,
      max_tokens = OPENAI_CONFIG.DEFAULT_MAX_TOKENS,
      useResponseSchema = false,
    } = options;

    try {
      const requestBody: any = {
        model,
        messages,
        temperature,
        max_tokens,
      };

      if (useResponseSchema) {
        requestBody.response_format = RESPONSE_SCHEMA;
      }

      const response = await this.client.post<ChatCompletionResponse>(
        '/chat/completions',
        requestBody
      );

      // Usage 정보 로깅
      if (response.data.usage) {
        this.logger.log({
          model,
          prompt_tokens: response.data.usage.prompt_tokens,
          completion_tokens: response.data.usage.completion_tokens,
          total_tokens: response.data.usage.total_tokens,
        });
      }

      return response.data;
    } catch (error: any) {
      if (error.response) {
        const errorMessage = `OpenAI API Error: ${error.response.status} - ${error.response.data?.error?.message || error.message}`;
        this.logger.error(errorMessage);
        throw new Error(errorMessage);
      }
      this.logger.error('OpenAI API request failed', error);
      throw error;
    }
  }

  /**
   * 아이템 이름 필터링
   * @param items 원본 아이템 이름 배열
   * @param systemPrompt 커스텀 시스템 프롬프트 (선택)
   * @returns 필터링된 아이템 배열
   */
  async filterItemName(
    items: string[],
    systemPrompt?: string
  ): Promise<FilterResultItem[]> {
    // 빈 배열 처리
    if (!items || items.length === 0) {
      return [];
    }

    // 메시지 생성
    const messages = this.buildFilterMessages(items, systemPrompt);
    
    // API 호출 및 파싱
    const responseStr = await this.ask(messages, { useResponseSchema: true });
    
    return this.parseFilterResponse(responseStr);
  }

  /**
   * 필터링 메시지 생성 (헬퍼 메서드)
   */
  private buildFilterMessages(
    items: string[],
    systemPrompt?: string
  ): Array<OpenAiRequest> {
    const messages: Array<OpenAiRequest> = [];
    
    // 시스템 프롬프트 추가
    if (!systemPrompt) {
      messages.push({ role: 'system', content: FILTER_PROMPT });
    } else {
      messages.push({ role: 'system', content: systemPrompt });
    }

    // 인덱싱된 아이템 데이터 추가
    const indexedItems = items.map((item, index) => ({
      index,
      rawInput: item,
    }));

    messages.push({
      role: 'user',
      content: JSON.stringify({ items: indexedItems }),
    });

    return messages;
  }

  /**
   * 필터 응답 파싱 (헬퍼 메서드)
   */
  private parseFilterResponse(responseStr: string): FilterResultItem[] {
    try {
      const parsed = JSON.parse(responseStr) as FilterResponse;
      
      if (parsed?.results && Array.isArray(parsed.results) && parsed.results.length > 0) {
        // index 순서대로 정렬
        return parsed.results.sort((a, b) => a.index - b.index);
      }
      
      return [];
    } catch (error) {
      this.logger.error('Failed to parse filterItemName response', {
        error: error instanceof Error ? error.message : String(error),
        response: responseStr,
      });
      return [];
    }
  }

  /**
   * 간단한 질문-답변
   * @param messages 메시지 배열
   * @param options OpenAI API 옵션
   * @returns 답변 텍스트
   */
  async ask(
    messages: Array<OpenAiRequest>,
    options: ChatCompletionOptions = {}
  ): Promise<string> {
    const response = await this.chatCompletion(messages, options);
    const content = response.choices[0]?.message?.content || '';
    
    if (!content) {
      this.logger.warn('Empty response from OpenAI API', {
        finish_reason: response.choices[0]?.finish_reason,
      });
    }
    
    return content;
  }

  /**
   * API 키 유효성 검사
   * @returns API 키가 유효한지 여부
   */
  async validateApiKey(): Promise<boolean> {
    try {
      await this.chatCompletion(
        [{ role: 'user', content: 'test' }],
        { max_tokens: 5 }
      );
      return true;
    } catch (error: any) {
      this.logger.error('API key validation failed', error?.message);
      return false;
    }
  }
}