import {
  SubscribeMessage,
  WebSocketGateway,
  OnGatewayConnection,
  OnGatewayDisconnect,
  WebSocketServer,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';

@WebSocketGateway({ cors: true })
export class WebrtcGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  private room: string = 'default-room';

  handleConnection(socket: Socket) {
    socket.join(this.room);
    const clients = Array.from(this.server.sockets.adapter.rooms.get(this.room) || []);
    const otherClient = clients.find((id) => id !== socket.id);

    if (otherClient) {
      this.server.to(otherClient).emit('match-found', { socketId: socket.id });
      socket.emit('match-found', { socketId: otherClient });
    }

    console.log(`[Socket Connected] ${socket.id}`);
  }

  handleDisconnect(socket: Socket) {
    socket.leave(this.room);
    socket.broadcast.emit('user-disconnected', socket.id);
    console.log(`[Socket Disconnected] ${socket.id}`);
  }

  @SubscribeMessage('sending-signal')
  handleSendingSignal(
    socket: Socket,
    payload: { userToSignal: string; signal: any; callerId: string }
  ) {
    this.server.to(payload.userToSignal).emit('user-joined', {
      signal: payload.signal,
      callerId: payload.callerId,
    });
  }

  @SubscribeMessage('returning-signal')
  handleReturningSignal(
    socket: Socket,
    payload: { callerId: string; signal: any }
  ) {
    this.server.to(payload.callerId).emit('receiving-returned-signal', {
      signal: payload.signal,
      id: socket.id,
    });
  }

  @SubscribeMessage('ice-candidate')
  handleIceCandidate(
    socket: Socket,
    payload: { to: string; candidate: RTCIceCandidateInit }
  ) {
    this.server.to(payload.to).emit('ice-candidate', payload.candidate);
  }
}
