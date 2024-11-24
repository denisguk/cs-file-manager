import { WebSocketGateway, WebSocketServer, SubscribeMessage, MessageBody } from '@nestjs/websockets';
import { Server } from 'socket.io';

@WebSocketGateway()
export class FileGateway {
  @WebSocketServer()
  server: Server;

  sendProgress(fileName: string, progress: number) {
    this.server.emit('uploadProgress', { fileName, progress });
  }
}