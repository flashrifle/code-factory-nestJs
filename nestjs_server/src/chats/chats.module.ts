import { Module } from '@nestjs/common';
import { ChatsService } from './chats.service';
import { ChatsController } from './chats.controller';
import { ChatGateway } from './chat.gateway';

@Module({
  controllers: [ChatsController],
  providers: [ChatGateway, ChatsService],
})
export class ChatsModule {}
