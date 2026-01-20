import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { OpenAIService } from './openai.service';
import { OpenAIController } from './openai.controller';

@Module({
  imports: [// app.module.ts
    ConfigModule.forRoot({
      isGlobal: true,
      // 환경에 따라 자동으로 파일 선택
      envFilePath: [
        `.env.${process.env.NODE_ENV || 'development'}.local`,
        '.env',
      ],
      // 환경 변수 검증 (선택사항)
      validationOptions: {
        allowUnknown: true,
        abortEarly: false,
      },
    })],
  controllers: [OpenAIController],
  providers: [OpenAIService],
  exports: [OpenAIService],
})
export class OpenAIModule {}