import {
  WebSocketGateway,
  WebSocketServer,
  OnGatewayConnection,
  OnGatewayDisconnect,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';

@WebSocketGateway({
  cors: {
    origin: [
      'https://conecta-iesrg66.vercel.app',
      'https://conecta-ies-front-rg66-l3m24f6oi-mister-guedes-projects.vercel.app',
      'http://localhost:4200',
      process.env.FRONTEND_URL || 'http://localhost:4200',
    ],
    credentials: true,
  },
})
export class WebsocketGateway
  implements OnGatewayConnection, OnGatewayDisconnect
{
  @WebSocketServer()
  server: Server;

  handleConnection(client: Socket) {
    console.log(`Cliente conectado: ${client.id}`);
  }

  handleDisconnect(client: Socket) {
    console.log(`Cliente desconectado: ${client.id}`);
  }

  // Emitir nova solicitação para todos os clientes (especialmente admins)
  emitirNovaSolicitacao(solicitacao: { id: number; [key: string]: any }) {
    this.server.emit('nova-solicitacao', solicitacao);
    console.log('WebSocket: nova-solicitacao emitido', solicitacao.id);
  }

  // Emitir atualização de status
  emitirAtualizacaoStatus(solicitacaoId: number, status: string) {
    const payload = {
      solicitacaoId,
      status,
      timestamp: new Date(),
    };
    this.server.emit('atualizacao-status', payload);
    console.log('WebSocket: atualizacao-status emitido', payload);
  }
}
