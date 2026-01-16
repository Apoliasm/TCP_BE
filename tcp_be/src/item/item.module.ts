import { Module } from '@nestjs/common';
import { ItemController } from './item.controller';
import { ItemService } from './item.service';

@Module({
  controllers: [ItemController],
  imports: [],
  providers: [ItemService],
})
export class ItemModule {}
