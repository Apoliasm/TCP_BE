import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ListingsModule } from './listings/listings.module';
import { PrismaModule } from './database/prisma.module';
import { ListingImagesModule } from './listings/listing-imgae.module';
import { ItemModule } from './item/item.module';
import { UserModule } from './user/user.module';
import { ConfigModule } from '@nestjs/config';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      // 환경에 따라 자동으로 파일 선택
      envFilePath: [
        `.env.${process.env.NODE_ENV || 'development'}.local`,
        `.env.${process.env.NODE_ENV || 'development'}`,
        '.env.local',
        '.env',
      ],
      // 환경 변수 검증 (선택사항)
      validationOptions: {
        allowUnknown: true,
        abortEarly: false,
      },
    }),
    PrismaModule, ListingsModule, ListingImagesModule, ItemModule, UserModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
