import {
  MessageBody,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
  ConnectedSocket,
  OnGatewayInit,
  OnGatewayConnection,
  OnGatewayDisconnect,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';

interface JoinRoomPayload {
  roomId: string;
  userId: string;
}

@WebSocketGateway({
  cors: {
    origin: '*',
  },
})
export class WebrtcGateway
  implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect
{
  @WebSocketServer()
  server: Server;

  private rooms: Record<string, string[]> = {}; // roomId -> socketIds

  afterInit(server: Server) {
    console.log('WebSocket server initialized');
  }

  handleConnection(client: Socket) {
    console.log(`Client connected: ${client.id}`);
  }

  handleDisconnect(client: Socket) {
    console.log(`Client disconnected: ${client.id}`);

    for (const roomId in this.rooms) {
      this.rooms[roomId] = this.rooms[roomId].filter(id => id !== client.id);
      this.server.to(roomId).emit('user-disconnected', client.id);

      // If room is empty, delete it
      if (this.rooms[roomId].length === 0) {
        delete this.rooms[roomId];
      }
    }
  }

  @SubscribeMessage('join-room')
  handleJoinRoom(
    @MessageBody() data: JoinRoomPayload,
    @ConnectedSocket() client: Socket,
  ) {

    console.log('🚀 join-room payload:', data, 'Socket ID:', client.id);
    const { roomId } = data;
    client.join(roomId);

    if (!this.rooms[roomId]) {
      this.rooms[roomId] = [];
    }

    this.rooms[roomId].push(client.id);

    const otherUsers = this.rooms[roomId].filter(id => id !== client.id);
    client.emit('all-users', otherUsers); // emit existing users to the new user

    // Notify other users in the room
    client.to(roomId).emit('user-joined', client.id);
  }

  @SubscribeMessage('sending-signal')
  handleSendingSignal(
    @MessageBody()
    payload: { userToSignal: string; signal: any; callerId: string },
  ) {
    this.server.to(payload.userToSignal).emit('user-signal', {
      signal: payload.signal,
      callerId: payload.callerId,
    });
  }

  @SubscribeMessage('returning-signal')
  handleReturningSignal(
    @MessageBody()
    payload: { signal: any; callerId: string; id: string },
  ) {
    this.server.to(payload.callerId).emit('receiving-returned-signal', {
      signal: payload.signal,
      id: payload.id,
    });
  }
}
