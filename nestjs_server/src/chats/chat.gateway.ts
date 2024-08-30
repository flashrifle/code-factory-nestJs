import {
  ConnectedSocket,
  MessageBody,
  OnGatewayConnection,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { CreateChatDto } from './dto/create-chat.dto';
import { ChatsService } from './chats.service';

@WebSocketGateway({
  // ws://localhost:3000/chats
  namespace: 'chats',
})
export class ChatGateway implements OnGatewayConnection {
  constructor(private readonly chatService: ChatsService) {}

  @WebSocketServer()
  server: Server;

  handleConnection(socket: Socket) {
    console.log(`on connect called : ${socket.id}`);
  }

  @SubscribeMessage('create_chat')
  async createChat(@MessageBody() data: CreateChatDto, @ConnectedSocket() socket: Socket) {
    const chat = await this.chatService.createChat(data);
  }

  @SubscribeMessage('enter_chat')
  enterChat(
    // 방의 chat ID를 리스트로 받는다.
    @MessageBody() data: number[],
    @ConnectedSocket() socket: Socket,
  ) {
    for (const chatId of data) {
      // socket.join()
      socket.join(chatId.toString());
    }
  }

  // socket.on('send_msg', (msg) => {console.log(msg)};
  @SubscribeMessage('send_message')
  sendMessage(@MessageBody() message: { message: string; chatId: string }, @ConnectedSocket() socket: Socket) {
    // this.server.in(message.chatId.toString()).emit('receive_message', message.message);
    socket.to(message.chatId.toString()).emit('receive_message', message.message);
  }
}
