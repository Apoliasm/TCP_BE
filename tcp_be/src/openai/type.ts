export type OpenAiRequest = { role: 'system' | 'user' | 'assistant'; content: string }

export type FilterResultItem = { index: number; cleanName: string | null };

// ✅ 응답은 "results"가 배열인 단일 구조로 고정
export type FilterResponse = { results: FilterResultItem[] };

// ChatCompletion 응답 타입
export interface ChatCompletionResponse {
  id: string;
  object: string;
  created: number;
  model: string;
  choices: Array<{
    index: number;
    message: {
      role: string;
      content: string | null;
    };
    finish_reason: string | null;
  }>;
  usage?: {
    prompt_tokens: number;
    completion_tokens: number;
    total_tokens: number;
  };
}


export interface ChatCompletionOptions {
    model?: string;
    temperature?: number;
    max_tokens?: number;
    useResponseSchema?: boolean;
  }