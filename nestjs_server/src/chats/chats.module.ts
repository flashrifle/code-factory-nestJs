import { Module } from '@nestjs/common';
import { ChatsService } from './chats.service';
import { ChatsController } from './chats.controller';
import { ChatGateway } from './chat.gateway';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ChatsModel } from './entity/chats.entity';

@Module({
  imports: [TypeOrmModule.forFeature([ChatsModel])],
  controllers: [ChatsController],
  providers: [ChatGateway, ChatsService],
})
export class ChatsModule {}
