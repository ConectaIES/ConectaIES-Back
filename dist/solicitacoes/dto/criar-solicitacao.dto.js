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
exports.AtribuirSolicitacaoDto = exports.PrimeiraRespostaDto = exports.AdicionarComentarioDto = exports.CriarSolicitacaoDto = void 0;
const class_validator_1 = require("class-validator");
const entities_1 = require("../../database/entities");
class CriarSolicitacaoDto {
    titulo;
    descricao;
    tipo;
}
exports.CriarSolicitacaoDto = CriarSolicitacaoDto;
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], CriarSolicitacaoDto.prototype, "titulo", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], CriarSolicitacaoDto.prototype, "descricao", void 0);
__decorate([
    (0, class_validator_1.IsEnum)(entities_1.TipoSolicitacao),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], CriarSolicitacaoDto.prototype, "tipo", void 0);
class AdicionarComentarioDto {
    comentario;
}
exports.AdicionarComentarioDto = AdicionarComentarioDto;
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], AdicionarComentarioDto.prototype, "comentario", void 0);
class PrimeiraRespostaDto {
    resposta;
}
exports.PrimeiraRespostaDto = PrimeiraRespostaDto;
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], PrimeiraRespostaDto.prototype, "resposta", void 0);
class AtribuirSolicitacaoDto {
    usuarioId;
    nota;
}
exports.AtribuirSolicitacaoDto = AtribuirSolicitacaoDto;
__decorate([
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", Number)
], AtribuirSolicitacaoDto.prototype, "usuarioId", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], AtribuirSolicitacaoDto.prototype, "nota", void 0);
//# sourceMappingURL=criar-solicitacao.dto.js.map