// src/gateway/app.gateway.ts
import {
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
  OnGatewayConnection,
  OnGatewayDisconnect,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';

@WebSocketGateway({
  cors: {
    origin: '*',
    methods: ['GET', 'POST'],
  },
})
export class WebrtcGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer() server: Server;

  private users: Map<string, Socket> = new Map();
  private waitingUser: string | null = null;

  handleConnection(socket: Socket) {
    console.log(`✅ Client connected: ${socket.id}`);
  }

  handleDisconnect(socket: Socket) {
    console.log(`❌ Client disconnected: ${socket.id}`);
    this.users.delete(socket.id);

    if (this.waitingUser === socket.id) {
      this.waitingUser = null;
    }

    socket.broadcast.emit('user-disconnected', socket.id);
  }

  @SubscribeMessage('join-room')
  handleJoin(socket: Socket, payload: { roomId: string }) {
    console.log('🚀 join-room payload:', payload, 'Socket ID:', socket.id);
    const { roomId } = payload;
    socket.join(roomId);

    if (this.waitingUser && this.waitingUser !== socket.id) {
      const otherUser = this.waitingUser;
      this.waitingUser = null;

      this.server.to(otherUser).emit('match-found', { socketId: socket.id });
      this.server.to(socket.id).emit('match-found', { socketId: otherUser });

      console.log(`🎯 Matched: ${otherUser} <--> ${socket.id}`);
    } else {
      this.waitingUser = socket.id;
      console.log('🕒 Waiting for another user to join...');
    }
  }

  @SubscribeMessage('sending-signal')
  handleSendingSignal(socket: Socket, payload: any) {
    this.server.to(payload.userToSignal).emit('user-joined', {
      signal: payload.signal,
      callerId: socket.id,
    });
  }

  @SubscribeMessage('returning-signal')
  handleReturningSignal(socket: Socket, payload: any) {
    this.server.to(payload.callerId).emit('receiving-returned-signal', {
      signal: payload.signal,
      id: socket.id,
    });
  }
}
