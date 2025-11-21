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
exports.EventoHistorico = exports.TipoEvento = void 0;
const typeorm_1 = require("typeorm");
const solicitacao_entity_1 = require("./solicitacao.entity");
const user_entity_1 = require("./user.entity");
var TipoEvento;
(function (TipoEvento) {
    TipoEvento["STATUS_CHANGE"] = "STATUS_CHANGE";
    TipoEvento["COMMENT"] = "COMMENT";
    TipoEvento["ATTACHMENT"] = "ATTACHMENT";
})(TipoEvento || (exports.TipoEvento = TipoEvento = {}));
let EventoHistorico = class EventoHistorico {
    id;
    solicitacaoId;
    solicitacao;
    eventoTipo;
    descricao;
    usuarioId;
    usuario;
    timestamp;
};
exports.EventoHistorico = EventoHistorico;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)(),
    __metadata("design:type", Number)
], EventoHistorico.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'solicitacao_id' }),
    __metadata("design:type", Number)
], EventoHistorico.prototype, "solicitacaoId", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => solicitacao_entity_1.Solicitacao, (solicitacao) => solicitacao.eventos, {
        onDelete: 'CASCADE',
    }),
    (0, typeorm_1.JoinColumn)({ name: 'solicitacao_id' }),
    __metadata("design:type", solicitacao_entity_1.Solicitacao)
], EventoHistorico.prototype, "solicitacao", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: 'varchar',
        length: 50,
        name: 'evento_tipo',
    }),
    __metadata("design:type", String)
], EventoHistorico.prototype, "eventoTipo", void 0);
__decorate([
    (0, typeorm_1.Column)('text'),
    __metadata("design:type", String)
], EventoHistorico.prototype, "descricao", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true, name: 'usuario_id' }),
    __metadata("design:type", Number)
], EventoHistorico.prototype, "usuarioId", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => user_entity_1.User, (user) => user.eventos, { onDelete: 'SET NULL' }),
    (0, typeorm_1.JoinColumn)({ name: 'usuario_id' }),
    __metadata("design:type", user_entity_1.User)
], EventoHistorico.prototype, "usuario", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)(),
    __metadata("design:type", Date)
], EventoHistorico.prototype, "timestamp", void 0);
exports.EventoHistorico = EventoHistorico = __decorate([
    (0, typeorm_1.Entity)('event_history')
], EventoHistorico);
//# sourceMappingURL=evento-historico.entity.js.map