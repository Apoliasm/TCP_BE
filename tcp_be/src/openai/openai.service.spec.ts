import 'dotenv/config';
import { Test, TestingModule } from '@nestjs/testing';
import axios from 'axios';
import { OpenAIService } from './openai.service';

// axios를 mock
jest.mock('axios');
const mockedAxios = axios as jest.Mocked<typeof axios>;

describe('OpenAIService', () => {
  let service: OpenAIService;
  let axiosInstance: {
    post: jest.Mock;
  };

  beforeEach(async () => {
    // axios.create mock 설정
    axiosInstance = {
      post: jest.fn(),
    };

    if (!process.env.OPENAI_API_KEY) {
        process.env.OPENAI_API_KEY = 'test-api-key';
      }

    mockedAxios.create = jest.fn(() => axiosInstance as any);

    // 테스트 실행 전 환경 변수 강제 세팅 (테스트 환경에서 process.env가 제대로 적용 안됐을 때를 방지)
    
    const module: TestingModule = await Test.createTestingModule({
      providers: [OpenAIService],
    }).compile();

    service = module.get<OpenAIService>(OpenAIService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('chatCompletion', () => {
    it('should successfully call OpenAI chat completion API', async () => {
      const mockResponse = {
        data: {
          id: 'chatcmpl-123',
          object: 'chat.completion',
          created: 1677652288,
          choices: [
            {
              index: 0,
              message: {
                role: 'assistant',
                content: '안녕하세요! 무엇을 도와드릴까요?',
              },
              finish_reason: 'stop',
            },
          ],
          usage: {
            prompt_tokens: 9,
            completion_tokens: 12,
            total_tokens: 21,
          },
        },
      };

      axiosInstance.post.mockResolvedValue(mockResponse);

      const messages = [
        { role: 'user' as const, content: '안녕하세요' },
      ];

      const result = await service.chatCompletion(messages, { model: "gpt-4.1-nano" });

      expect(axiosInstance.post).toHaveBeenCalledWith(
        '/chat/completions',
        expect.objectContaining({
          model: "gpt-4.1-nano",
          messages,
          temperature: 0.7,
          max_tokens: 1000,
        }),
      );

      expect(result).toEqual(mockResponse.data);
      expect(result.choices[0].message.content).toBe('안녕하세요! 무엇을 도와드릴까요?');
    });

    it('should handle API errors properly', async () => {
      const errorResponse = {
        response: {
          status: 401,
          data: {
            error: {
              message: 'Invalid API key',
              type: 'invalid_request_error',
            },
          },
        },
      };

      axiosInstance.post.mockRejectedValue(errorResponse);

      const messages = [
        { role: 'user' as const, content: 'test' },
      ];

      await expect(service.chatCompletion(messages)).rejects.toThrow(
        'OpenAI API Error: 401 - Invalid API key',
      );
    });

    it('should use custom model when provided', async () => {
      const mockResponse = {
        data: {
          choices: [{ message: { content: 'test' } }],
        },
      };

      axiosInstance.post.mockResolvedValue(mockResponse);

      await service.chatCompletion(
        [{ role: 'user' as const, content: 'test' }],
        { model: 'gpt-4' },
      );

      expect(axiosInstance.post).toHaveBeenCalledWith(
        '/chat/completions',
        expect.objectContaining({"max_tokens": 1000, "messages": [{"content": "test", "role": "user"}], "model": "gpt-4", "temperature": 0.7}),
      );
    });
  });

  describe('ask', () => {
    it('should return answer from simple question', async () => {
      const mockResponse = {
        data: {
          choices: [
            {
              message: {
                content: 'Yes, TypeScript is a programming language.',
              },
            },
          ],
        },
      };

      axiosInstance.post.mockResolvedValue(mockResponse);

      const messages = [{ role: 'user' as const, content: 'What is TypeScript?' }];
      const answer = await service.ask(messages);

      expect(answer).toBe('Yes, TypeScript is a programming language.');
      expect(axiosInstance.post).toHaveBeenCalledWith(
        '/chat/completions',
        expect.objectContaining({
          messages: [
            { role: 'user', content: 'What is TypeScript?' },
          ],
        }),
      );
    });

    it('should include system prompt when provided', async () => {
      const mockResponse = {
        data: {
          choices: [{ message: { content: 'test' } }],
        },
      };

      axiosInstance.post.mockResolvedValue(mockResponse);

      const messages = [
        { role: 'system' as const, content: '당신은 도움이 되는 어시스턴트입니다.' },
        { role: 'user' as const, content: '질문' },
      ];
      await service.ask(messages);

      expect(axiosInstance.post).toHaveBeenCalledWith(
        '/chat/completions',
        expect.objectContaining({
          messages: [
            { role: 'system', content: '당신은 도움이 되는 어시스턴트입니다.' },
            { role: 'user', content: '질문' },
          ],
        }),
      );
    });
  });

  describe('validateApiKey', () => {
    it('should return true when API key is valid', async () => {
      axiosInstance.post.mockResolvedValue({
        data: {
          choices: [{ message: { content: 'test' } }],
        },
      });

      const isValid = await service.validateApiKey();

      expect(isValid).toBe(true);
    });

    it('should return false when API key is invalid', async () => {
      axiosInstance.post.mockRejectedValue({
        response: {
          status: 401,
          data: {
            error: {
              message: 'Invalid API key',
            },
          },
        },
      });

      const isValid = await service.validateApiKey();

      expect(isValid).toBe(false);
    });
  });

  describe("filterItemName", () => {
    it("test", async () => {
      const items = ["임펄스 시크 3장 ㅍㅍ"];
      const mockContent =
        JSON.stringify({
          results: [
            { index: 0, cleanName: "임펄스" },
          ],
        });
  
      const mockResponse = {
        choices: [{ message: { content: mockContent } }],
      };
      axiosInstance.post.mockResolvedValue({ data: mockResponse });
  
      const result = await service.filterItemName(items);
  
      // ✅ API 호출 검증
      expect(axiosInstance.post).toHaveBeenCalledWith(
        "/chat/completions",
        expect.objectContaining({
          // model: expect.any(String), // 필요하면 추가
          messages: expect.arrayContaining([
            expect.objectContaining({
              role: "user", 
              // user content 안에 배열+index 형태가 들어가는지 확인
              content: expect.stringContaining('"index":0'),
            }),
          ]),
        }),
      );
  
      // ✅ 반환값 검증: 파싱된 결과 배열
      expect(result).toEqual([
        { index: 0, cleanName: "임펄스" },
      ]);
    });
    it("should call chatCompletion with system prompt and user payload containing indexed items", async () => {
      const items = ["블루아이즈 화이트 드래곤 3장 일괄", "블랙 매지션 x2 / 상태 A"];
      const mockContent =
        JSON.stringify({
          results: [
            { index: 0, cleanName: "블루아이즈 화이트 드래곤" },
            { index: 1, cleanName: "블랙 매지션" },
          ],
        });
  
      const mockResponse = {
        choices: [{ message: { content: mockContent } }],
      };
      axiosInstance.post.mockResolvedValue({ data: mockResponse });
  
      const result = await service.filterItemName(items);
  
      // ✅ API 호출 검증
      expect(axiosInstance.post).toHaveBeenCalledWith(
        "/chat/completions",
        expect.objectContaining({
          // model: expect.any(String), // 필요하면 추가
          messages: expect.arrayContaining([
            expect.objectContaining({
              role: "user", 
              // user content 안에 배열+index 형태가 들어가는지 확인
              content: expect.stringContaining('"index":0'),
            }),
          ]),
        }),
      );
  
      // ✅ 반환값 검증: 파싱된 결과 배열
      expect(result).toEqual([
        { index: 0, cleanName: "블루아이즈 화이트 드래곤" },
        { index: 1, cleanName: "블랙 매지션" },
      ]);
    });
  
    it("should use default system prompt when not provided", async () => {
      const items = ["유희왕 카드 여러장 팝니다", "강화 파츠 세트 (미개봉)"];
  
      // 첫 번째는 불명확 → null
      const mockContent = JSON.stringify({
        results: [
          { index: 0, cleanName: null },
          { index: 1, cleanName: "강화 파츠" },
        ],
      });
  
      axiosInstance.post.mockResolvedValue({
        data: { choices: [{ message: { content: mockContent } }] },
      });
  
      const result = await service.filterItemName(items);
  
      expect(axiosInstance.post).toHaveBeenCalledWith(
        "/chat/completions",
        expect.objectContaining({
          messages: expect.arrayContaining([
            { role: "system", content: expect.any(String) }, // default prompt
            expect.objectContaining({
              role: "user",
              content: expect.stringContaining("유희왕 카드 여러장 팝니다"),
            }),
          ]),
        }),
      );
  
      expect(result).toEqual([
        { index: 0, cleanName: null },
        { index: 1, cleanName: "강화 파츠" },
      ]);
    });
  
    it("should handle empty items array by calling model with empty payload and returning empty results", async () => {
      const items: string[] = [];
  
      const mockContent = JSON.stringify({ results: [] });
      axiosInstance.post.mockResolvedValue({
        data: { choices: [{ message: { content: mockContent } }] },
      });
  
      const result = await service.filterItemName(items);
  
      expect(axiosInstance.post).toHaveBeenCalledWith(
        "/chat/completions",
        expect.objectContaining({
          messages: expect.arrayContaining([{ role: "system", content: expect.any(String) }]),
        }),
      );
  
      expect(result).toEqual([]);
    });
  
    it("should throw (or fallback) when model returns invalid JSON", async () => {
      const items = ["블루아이즈 3장 일괄"];
  
      // JSON이 깨진 경우
      axiosInstance.post.mockResolvedValue({
        data: { choices: [{ message: { content: "NOT_JSON" } }] },
      });
  
      // ✅ 정책 1: throw
      await expect(service.filterItemName(items)).rejects.toThrow();
  
      // ✅ 정책 2: fallback(빈 결과)
      // const result = await service.filterItemName(items);
      // expect(result).toEqual([]);
    });
  
    it("should keep index mapping even if model returns results out of order", async () => {
      const items = ["A 2개", "B 1개", "C 5개"];
  
      const mockContent = JSON.stringify({
        results: [
          { index: 2, cleanName: "C" },
          { index: 0, cleanName: "A" },
          { index: 1, cleanName: "B" },
        ],
      });
  
      axiosInstance.post.mockResolvedValue({
        data: { choices: [{ message: { content: mockContent } }] },
      });
  
      const result = await service.filterItemName(items);
  
      // 서비스에서 정렬까지 보장하고 싶으면 아래처럼 테스트
      expect(result).toEqual([
        { index: 0, cleanName: "A" },
        { index: 1, cleanName: "B" },
        { index: 2, cleanName: "C" },
      ]);
    });
  });
  
});