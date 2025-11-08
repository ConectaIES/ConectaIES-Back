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
exports.Anexo = void 0;
const typeorm_1 = require("typeorm");
const solicitacao_entity_1 = require("./solicitacao.entity");
let Anexo = class Anexo {
    id;
    solicitacaoId;
    solicitacao;
    nome;
    url;
    tipo;
    createdAt;
};
exports.Anexo = Anexo;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)(),
    __metadata("design:type", Number)
], Anexo.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'solicitacao_id' }),
    __metadata("design:type", Number)
], Anexo.prototype, "solicitacaoId", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => solicitacao_entity_1.Solicitacao, (solicitacao) => solicitacao.anexos, {
        onDelete: 'CASCADE',
    }),
    (0, typeorm_1.JoinColumn)({ name: 'solicitacao_id' }),
    __metadata("design:type", solicitacao_entity_1.Solicitacao)
], Anexo.prototype, "solicitacao", void 0);
__decorate([
    (0, typeorm_1.Column)({ length: 255 }),
    __metadata("design:type", String)
], Anexo.prototype, "nome", void 0);
__decorate([
    (0, typeorm_1.Column)({ length: 500 }),
    __metadata("design:type", String)
], Anexo.prototype, "url", void 0);
__decorate([
    (0, typeorm_1.Column)({ length: 100 }),
    __metadata("design:type", String)
], Anexo.prototype, "tipo", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)({ name: 'created_at' }),
    __metadata("design:type", Date)
], Anexo.prototype, "createdAt", void 0);
exports.Anexo = Anexo = __decorate([
    (0, typeorm_1.Entity)('attachments')
], Anexo);
//# sourceMappingURL=anexo.entity.js.map