import {
  ConnectedSocket,
  MessageBody,
  OnGatewayConnection,
  OnGatewayDisconnect,
  OnGatewayInit,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
  WsException,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { CreateChatDto } from './dto/create-chat.dto';
import { ChatsService } from './chats.service';
import { EnterChatDto } from './dto/enter-chat.dto';
import { CreateMessageDto } from './messages/dto/create-message.dto';
import { ChatMessagesService } from './messages/messages.service';
import { UseFilters, UseGuards, UsePipes, ValidationPipe } from '@nestjs/common';
import { SocketCatchHttpExceptionFilter } from '../common/exception-filter/socket-catch-http.exception-filter';
import { SocketBearerTokenGuard } from '../auth/guard/socket/socket-bearer-token.guard';
import { UsersModel } from '../users/entity/users.entity';
import { UsersService } from '../users/users.service';
import { AuthService } from '../auth/auth.service';

@WebSocketGateway({
  // ws://localhost:3000/chats
  namespace: 'chats',
})
export class ChatGateway implements OnGatewayConnection, OnGatewayInit, OnGatewayDisconnect {
  constructor(
    private readonly chatsService: ChatsService,
    private readonly chatMessagesService: ChatMessagesService,
    private readonly usersService: UsersService,
    private readonly authService: AuthService,
  ) {}

  @WebSocketServer()
  server: Server;

  afterInit(server: any) {
    console.log(`after gateway init`);
  }

  handleDisconnect(socket: Socket) {
    console.log(`on disconnected called : ${socket.id}`);
  }

  async handleConnection(socket: Socket & { user: UsersModel }) {
    console.log(`on connect called : ${socket.id}`);

    const headers = socket.handshake.headers;

    // Bearer xxxxxx
    const rawToken = headers['authorization'];

    if (!rawToken) {
      socket.disconnect();
    }

    try {
      const token = this.authService.extractTokenFromHeader(rawToken, true);

      const payload = this.authService.verifyToken(token);
      const user = await this.usersService.getUserByEmail(payload.email);

      socket.user = user;

      return true;
    } catch (err) {
      socket.disconnect();
    }
  }

  @UsePipes(
    new ValidationPipe({
      transform: true,
      transformOptions: {
        enableImplicitConversion: true,
      },
      whitelist: true,
      forbidNonWhitelisted: true,
    }),
  )
  @UseFilters(SocketCatchHttpExceptionFilter)
  @SubscribeMessage('create_chat')
  async createChat(@MessageBody() data: CreateChatDto, @ConnectedSocket() socket: Socket & { user: UsersModel }) {
    const chat = await this.chatsService.createChat(data);
  }

  @UsePipes(
    new ValidationPipe({
      transform: true,
      transformOptions: {
        enableImplicitConversion: true,
      },
      whitelist: true,
      forbidNonWhitelisted: true,
    }),
  )
  @UseFilters(SocketCatchHttpExceptionFilter)
  @SubscribeMessage('enter_chat')
  async enterChat(
    // 방의 chat ID를 리스트로 받는다.
    @MessageBody() data: EnterChatDto,
    @ConnectedSocket() socket: Socket & { user: UsersModel },
  ) {
    for (const chatId of data.chatIds) {
      const exists = await this.chatsService.checkIfChatExists(chatId);
      if (!exists) {
        throw new WsException({
          code: 100,
          message: `존재하지 않는 chat 입니다. chatId: ${chatId}`,
        });
      }
    }

    socket.join(data.chatIds.map((x) => x.toString()));
  }

  @UsePipes(
    new ValidationPipe({
      transform: true,
      transformOptions: {
        enableImplicitConversion: true,
      },
      whitelist: true,
      forbidNonWhitelisted: true,
    }),
  )
  @UseFilters(SocketCatchHttpExceptionFilter)
  // socket.on('send_msg', (msg) => {console.log(msg)};
  @SubscribeMessage('send_message')
  async sendMessage(@MessageBody() dto: CreateMessageDto, @ConnectedSocket() socket: Socket & { user: UsersModel }) {
    const chatExists = await this.chatsService.checkIfChatExists(dto.chatId);
    if (!chatExists) {
      throw new WsException(`존재하지 않는 채팅방 입니다. Chat ID: ${dto.chatId}`);
    }
    const message = await this.chatMessagesService.createMessage(dto, socket.user.id);

    socket.to(message.chat.id.toString()).emit('receive_message', message.message);
    // this.server.in(message.chatId.toString()).emit('receive_message', message.message);
  }
}
