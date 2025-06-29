import {
  WebSocketGateway,
  SubscribeMessage,
  MessageBody,
  ConnectedSocket,
  OnGatewayConnection,
  OnGatewayDisconnect,
} from '@nestjs/websockets';
import { Socket } from 'socket.io';
import { UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@WebSocketGateway({
  cors: {
    origin: process.env.FRONTEND_URL || 'http://localhost:3001',
    credentials: true,
  },
})
export class NotificationsGateway
  implements OnGatewayConnection, OnGatewayDisconnect
{
  private connectedUsers = new Map<number, Socket>();

  handleConnection(client: Socket) {
    console.log(`Client connected: ${client.id}`);
  }

  handleDisconnect(client: Socket) {
    console.log(`Client disconnected: ${client.id}`);
    // Remove user from connected users map
    for (const [userId, socket] of this.connectedUsers.entries()) {
      if (socket.id === client.id) {
        this.connectedUsers.delete(userId);
        break;
      }
    }
  }

  @SubscribeMessage('join')
  handleJoin(
    @MessageBody() data: { userId: number },
    @ConnectedSocket() client: Socket,
  ) {
    this.connectedUsers.set(data.userId, client);
    client.join(`user_${data.userId}`);
    console.log(`User ${data.userId} joined notifications`);
  }

  sendToUser(userId: number, notification: any) {
    const socket = this.connectedUsers.get(userId);
    if (socket) {
      socket.emit('notification', notification);
    }
  }

  sendToAll(notification: any) {
    for (const socket of this.connectedUsers.values()) {
      socket.emit('notification', notification);
    }
  }
}
