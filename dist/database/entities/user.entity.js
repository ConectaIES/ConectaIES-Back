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
exports.User = exports.TipoPerfil = void 0;
const typeorm_1 = require("typeorm");
const solicitacao_entity_1 = require("./solicitacao.entity");
const evento_historico_entity_1 = require("./evento-historico.entity");
var TipoPerfil;
(function (TipoPerfil) {
    TipoPerfil["ALUNO"] = "ALUNO";
    TipoPerfil["PROFESSOR"] = "PROFESSOR";
    TipoPerfil["ADMIN"] = "ADMIN";
})(TipoPerfil || (exports.TipoPerfil = TipoPerfil = {}));
let User = class User {
    id;
    nome;
    email;
    senhaHash;
    tipoPerfil;
    createdAt;
    updatedAt;
    solicitacoes;
    eventos;
};
exports.User = User;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)(),
    __metadata("design:type", Number)
], User.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)({ length: 200 }),
    __metadata("design:type", String)
], User.prototype, "nome", void 0);
__decorate([
    (0, typeorm_1.Column)({ length: 200, unique: true }),
    __metadata("design:type", String)
], User.prototype, "email", void 0);
__decorate([
    (0, typeorm_1.Column)({ length: 255, name: 'senha_hash' }),
    __metadata("design:type", String)
], User.prototype, "senhaHash", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: 'enum',
        enum: TipoPerfil,
        name: 'tipo_perfil',
    }),
    __metadata("design:type", String)
], User.prototype, "tipoPerfil", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)({ name: 'created_at' }),
    __metadata("design:type", Date)
], User.prototype, "createdAt", void 0);
__decorate([
    (0, typeorm_1.UpdateDateColumn)({ name: 'updated_at' }),
    __metadata("design:type", Date)
], User.prototype, "updatedAt", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => solicitacao_entity_1.Solicitacao, (solicitacao) => solicitacao.usuario),
    __metadata("design:type", Array)
], User.prototype, "solicitacoes", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => evento_historico_entity_1.EventoHistorico, (evento) => evento.usuario),
    __metadata("design:type", Array)
], User.prototype, "eventos", void 0);
exports.User = User = __decorate([
    (0, typeorm_1.Entity)('users')
], User);
//# sourceMappingURL=user.entity.js.map