// webrtc.gateway.ts
import {
  MessageBody,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
  OnGatewayInit,
  ConnectedSocket,
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

    // Clean up user from all rooms
    for (const roomId in this.rooms) {
      this.rooms[roomId] = this.rooms[roomId].filter((id) => id !== client.id);
      this.server.to(roomId).emit('user-disconnected', client.id);
    }
  }

  @SubscribeMessage('join-room')
  handleJoinRoom(
    @MessageBody() data: JoinRoomPayload,
    @ConnectedSocket() client: Socket,
  ) {
    const { roomId } = data;

    client.join(roomId);

    if (!this.rooms[roomId]) {
      this.rooms[roomId] = [];
    }

    // Add new user to room
    this.rooms[roomId].push(client.id);

    // Send existing users to the newly joined client
    const otherUsers = this.rooms[roomId].filter((id) => id !== client.id);
    client.emit('all-users', otherUsers);

    // Notify others that a new user has joined
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
    @MessageBody() payload: { signal: any; callerId: string; id: string },
  ) {
    this.server.to(payload.callerId).emit('receiving-returned-signal', {
      signal: payload.signal,
      id: payload.id,
    });
  }
}