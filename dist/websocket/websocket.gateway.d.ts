import { OnGatewayConnection, OnGatewayDisconnect } from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
export declare class WebsocketGateway implements OnGatewayConnection, OnGatewayDisconnect {
    server: Server;
    handleConnection(client: Socket): void;
    handleDisconnect(client: Socket): void;
    emitirNovaSolicitacao(solicitacao: {
        id: number;
        [key: string]: any;
    }): void;
    emitirAtualizacaoStatus(solicitacaoId: number, status: string): void;
}
