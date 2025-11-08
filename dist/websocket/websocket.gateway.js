"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.WebsocketGateway = void 0;
const websockets_1 = require("@nestjs/websockets");
const socket_io_1 = require("socket.io");
let WebsocketGateway = class WebsocketGateway {
    server;
    handleConnection(client) {
        console.log(`Cliente conectado: ${client.id}`);
    }
    handleDisconnect(client) {
        console.log(`Cliente desconectado: ${client.id}`);
    }
    emitirNovaSolicitacao(solicitacao) {
        this.server.emit('nova-solicitacao', solicitacao);
        console.log('WebSocket: nova-solicitacao emitido', solicitacao.id);
    }
    emitirAtualizacaoStatus(solicitacaoId, status) {
        const payload = {
            solicitacaoId,
            status,
            timestamp: new Date(),
        };
        this.server.emit('atualizacao-status', payload);
        console.log('WebSocket: atualizacao-status emitido', payload);
    }
};
exports.WebsocketGateway = WebsocketGateway;
__decorate([
    (0, websockets_1.WebSocketServer)(),
    __metadata("design:type", socket_io_1.Server)
], WebsocketGateway.prototype, "server", void 0);
exports.WebsocketGateway = WebsocketGateway = __decorate([
    (0, websockets_1.WebSocketGateway)({
        cors: {
            origin: 'http://localhost:4200',
            credentials: true,
        },
    })
], WebsocketGateway);
//# sourceMappingURL=websocket.gateway.js.map