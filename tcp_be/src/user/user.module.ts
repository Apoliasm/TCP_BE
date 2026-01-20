import { Module } from '@nestjs/common';
import { UserController } from './user.controller';
import { UserService } from './user.service';
import { ListingsModule } from 'src/listings/listings.module';

@Module({
  controllers: [UserController],
  imports: [ListingsModule],
  providers: [UserService],
  
})
export class UserModule {}
