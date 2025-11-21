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
exports.Solicitacao = exports.StatusSolicitacao = exports.TipoSolicitacao = void 0;
const typeorm_1 = require("typeorm");
const user_entity_1 = require("./user.entity");
const anexo_entity_1 = require("./anexo.entity");
const evento_historico_entity_1 = require("./evento-historico.entity");
var TipoSolicitacao;
(function (TipoSolicitacao) {
    TipoSolicitacao["APOIO_LOCOMOCAO"] = "APOIO_LOCOMOCAO";
    TipoSolicitacao["INTERPRETACAO_LIBRAS"] = "INTERPRETACAO_LIBRAS";
    TipoSolicitacao["OUTROS"] = "OUTROS";
})(TipoSolicitacao || (exports.TipoSolicitacao = TipoSolicitacao = {}));
var StatusSolicitacao;
(function (StatusSolicitacao) {
    StatusSolicitacao["ABERTO"] = "ABERTO";
    StatusSolicitacao["NAO_VISTO"] = "NAO_VISTO";
    StatusSolicitacao["EM_ANALISE"] = "EM_ANALISE";
    StatusSolicitacao["EM_EXECUCAO"] = "EM_EXECUCAO";
    StatusSolicitacao["RESOLVIDO"] = "RESOLVIDO";
})(StatusSolicitacao || (exports.StatusSolicitacao = StatusSolicitacao = {}));
let Solicitacao = class Solicitacao {
    id;
    protocolo;
    titulo;
    descricao;
    tipo;
    status;
    usuarioId;
    usuario;
    createdAt;
    updatedAt;
    firstResponseAt;
    anexos;
    eventos;
    timeToTmrBreach;
};
exports.Solicitacao = Solicitacao;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)(),
    __metadata("design:type", Number)
], Solicitacao.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)({ length: 50, unique: true }),
    __metadata("design:type", String)
], Solicitacao.prototype, "protocolo", void 0);
__decorate([
    (0, typeorm_1.Column)({ length: 200 }),
    __metadata("design:type", String)
], Solicitacao.prototype, "titulo", void 0);
__decorate([
    (0, typeorm_1.Column)('text'),
    __metadata("design:type", String)
], Solicitacao.prototype, "descricao", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: 'varchar',
        length: 50,
    }),
    __metadata("design:type", String)
], Solicitacao.prototype, "tipo", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: 'varchar',
        length: 50,
        default: 'ABERTO',
    }),
    __metadata("design:type", String)
], Solicitacao.prototype, "status", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'usuario_id' }),
    __metadata("design:type", Number)
], Solicitacao.prototype, "usuarioId", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => user_entity_1.User, (user) => user.solicitacoes),
    (0, typeorm_1.JoinColumn)({ name: 'usuario_id' }),
    __metadata("design:type", user_entity_1.User)
], Solicitacao.prototype, "usuario", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)({ name: 'created_at' }),
    __metadata("design:type", Date)
], Solicitacao.prototype, "createdAt", void 0);
__decorate([
    (0, typeorm_1.UpdateDateColumn)({ name: 'updated_at' }),
    __metadata("design:type", Date)
], Solicitacao.prototype, "updatedAt", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'timestamp', nullable: true, name: 'first_response_at' }),
    __metadata("design:type", Date)
], Solicitacao.prototype, "firstResponseAt", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => anexo_entity_1.Anexo, (anexo) => anexo.solicitacao, { cascade: true }),
    __metadata("design:type", Array)
], Solicitacao.prototype, "anexos", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => evento_historico_entity_1.EventoHistorico, (evento) => evento.solicitacao, {
        cascade: true,
    }),
    __metadata("design:type", Array)
], Solicitacao.prototype, "eventos", void 0);
exports.Solicitacao = Solicitacao = __decorate([
    (0, typeorm_1.Entity)('solicitations')
], Solicitacao);
//# sourceMappingURL=solicitacao.entity.js.map