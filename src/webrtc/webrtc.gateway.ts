import {
  WebSocketGateway,
  SubscribeMessage,
  MessageBody,
  WebSocketServer,
} from '@nestjs/websockets';
import { Server } from 'socket.io';

@WebSocketGateway({ cors: true })
export class WebrtcGateway {
  @WebSocketServer()
  server: Server;

  @SubscribeMessage('join-room')
  handleJoin(@MessageBody() data: { roomId: string; userId: string }) {
    this.server.to(data.roomId).emit('user-joined', data.userId);
  }

  @SubscribeMessage('signal')
  handleSignal(
    @MessageBody() data: { roomId: string; signal: any; userId: string },
  ) {
    this.server.to(data.roomId).emit('signal', data);
  }
}
