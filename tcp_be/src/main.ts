import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

// ✅ Express 전용 타입 + path join 추가
import { NestExpressApplication } from '@nestjs/platform-express';
import { join } from 'path';
import { LoggingInterceptor } from './common/interceptors/logging.interceptor';

async function bootstrap() {
  // ✅ 제네릭으로 NestExpressApplication 명시
  const app = await NestFactory.create<NestExpressApplication>(AppModule);

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  // CORS
  app.enableCors({
    origin: 'http://localhost:3001',
    credentials: true,
  });

  const uploadsPath = join(process.cwd(), '/uploads');
  console.log('Static uploads rootPath:', uploadsPath);
  // 정적 이미지 서빙 (/uploads/** → 실제 uploads 디렉토리)
  app.useStaticAssets(uploadsPath, {
    prefix: '/uploads/', // 예: http://localhost:3000/uploads/파일명.jpg
  });
  app.useGlobalInterceptors(new LoggingInterceptor());
  const config = new DocumentBuilder()
    .setTitle('TCP 카드 거래 API')
    .setDescription('TCP 프로젝트 백엔드 API 명세서')
    .setVersion('0.1')
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api-docs', app, document); // /api-docs 로 접속

  await app.listen(3000);
}
bootstrap();
