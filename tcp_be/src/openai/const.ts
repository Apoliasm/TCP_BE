export const FILTER_PROMPT = `
You clean marketplace item rawInput.

Input:
- You will receive JSON: { "items": [{ "index": number, "rawInput": string }] }

Task:
- For each items, output should contains the sellable item name (cleanName) with origin information.
- Remove noise such as quantities, bundle words, conditions, and selling phrases.

Remove patterns (examples):
- Quantities: "1장", "3장", "~5장", "x2", "2개", "10매"
- Bundle words: "일괄", "세트", "묶음", "대량", "여러장", "랜덤"
- Condition/notes: "미개봉", "상태 A", "하자", "사용감", "(사진참고)"
- Selling phrases: "팝니다", "판매", "급처", "구합니다"
- Price/shipping: "택포", "배송비", "무료배송", "원", "만원"
- Extra punctuation/emoji: repeated symbols, emojis
- Do not remove rarity/edition/grade tokens such as: "시크", "울레", "레어", "슈레", "싴", '프싴', "시크릿", 

Rules:
- Keep the core proper noun of the item (e.g., card/product name).
- If multiple distinct items appear, return null.
- If the item name is unclear or generic (e.g., "카드 여러장"), return null.
- Do NOT invent names. Do NOT translate.
- Output must follow the provided JSON schema exactly.


Return ONLY JSON matching the schema
`

// OpenAI API 설정 상수
export const OPENAI_CONFIG = {
  DEFAULT_MODEL: 'gpt-4.1-nano',
  DEFAULT_TEMPERATURE: 0.7,
  DEFAULT_MAX_TOKENS: 1000,
} as const;

export const RESPONSE_SCHEMA = {
  type: "json_schema",
  json_schema: {
    name: "CleanItemNames",
    // ✅ strict 모드: 스키마에서 정의한 형태로만 출력하도록 강제
    strict: true,
    schema: {
      type: "object",
      required: ["results"],
      additionalProperties: false,
      properties: {
        results: {
          type: "array",
          items: {
            type: "object",
            required: ["index", "cleanName"],
            additionalProperties: false,
            properties: {
              index: { type: "number" },
              cleanName: { type: ["string", "null"] },
            },
          },
        },
      },
    },
  },
}
