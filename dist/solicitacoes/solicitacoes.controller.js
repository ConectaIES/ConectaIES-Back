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
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.SolicitacoesController = void 0;
const common_1 = require("@nestjs/common");
const platform_express_1 = require("@nestjs/platform-express");
const multer_1 = require("multer");
const path_1 = require("path");
const jwt_auth_guard_1 = require("../auth/jwt-auth.guard");
const solicitacoes_service_1 = require("./solicitacoes.service");
const entities_1 = require("../database/entities");
const dto_1 = require("./dto");
let SolicitacoesController = class SolicitacoesController {
    solicitacoesService;
    constructor(solicitacoesService) {
        this.solicitacoesService = solicitacoesService;
    }
    async criar(dto, files, req) {
        if (files && files.length > 3) {
            throw new common_1.BadRequestException('Máximo de 3 anexos permitidos');
        }
        return this.solicitacoesService.criar(dto, req.user.id, files);
    }
    async listarMinhas(req) {
        return this.solicitacoesService.listarMinhas(req.user.id);
    }
    async listarNovas(req) {
        if (req.user.tipoPerfil !== entities_1.TipoPerfil.ADMIN) {
            throw new common_1.ForbiddenException('Acesso negado');
        }
        return this.solicitacoesService.listarNovas();
    }
    async listarResolvidas(req) {
        if (req.user.tipoPerfil !== entities_1.TipoPerfil.ADMIN) {
            throw new common_1.ForbiddenException('Acesso negado');
        }
        return this.solicitacoesService.listarResolvidas();
    }
    async obter(id) {
        return this.solicitacoesService.obterPorId(+id);
    }
    async obterHistorico(id) {
        return this.solicitacoesService.obterHistorico(+id);
    }
    async adicionarComentario(id, dto, req) {
        return this.solicitacoesService.adicionarComentario(+id, dto.comentario, req.user.id);
    }
    async marcarResolvida(id, req) {
        return this.solicitacoesService.marcarResolvida(+id, req.user.id);
    }
    async atribuir(id, dto, req) {
        if (req.user.tipoPerfil !== entities_1.TipoPerfil.ADMIN) {
            throw new common_1.ForbiddenException('Acesso negado');
        }
        return this.solicitacoesService.atribuir(+id, dto.usuarioId, dto.nota, req.user.id);
    }
    async primeiraResposta(id, dto, req) {
        if (req.user.tipoPerfil !== entities_1.TipoPerfil.ADMIN) {
            throw new common_1.ForbiddenException('Acesso negado');
        }
        return this.solicitacoesService.primeiraResposta(+id, dto.resposta, req.user.id);
    }
};
exports.SolicitacoesController = SolicitacoesController;
__decorate([
    (0, common_1.Post)(),
    (0, common_1.UseInterceptors)((0, platform_express_1.FilesInterceptor)('anexos', 3, {
        storage: (0, multer_1.diskStorage)({
            destination: './uploads',
            filename: (req, file, cb) => {
                const randomName = Array(32)
                    .fill(null)
                    .map(() => Math.round(Math.random() * 16).toString(16))
                    .join('');
                cb(null, `${randomName}${(0, path_1.extname)(file.originalname)}`);
            },
        }),
        limits: {
            fileSize: 5 * 1024 * 1024,
        },
        fileFilter: (req, file, cb) => {
            const allowedTypes = [
                'image/jpeg',
                'image/png',
                'application/pdf',
                'application/msword',
                'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
            ];
            if (allowedTypes.includes(file.mimetype)) {
                cb(null, true);
            }
            else {
                cb(new common_1.BadRequestException('Tipo de arquivo não permitido'), false);
            }
        },
    })),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.UploadedFiles)()),
    __param(2, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [dto_1.CriarSolicitacaoDto, Array, Object]),
    __metadata("design:returntype", Promise)
], SolicitacoesController.prototype, "criar", null);
__decorate([
    (0, common_1.Get)('minhas'),
    __param(0, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], SolicitacoesController.prototype, "listarMinhas", null);
__decorate([
    (0, common_1.Get)('admin/novas'),
    __param(0, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], SolicitacoesController.prototype, "listarNovas", null);
__decorate([
    (0, common_1.Get)('admin/resolvidas'),
    __param(0, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], SolicitacoesController.prototype, "listarResolvidas", null);
__decorate([
    (0, common_1.Get)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], SolicitacoesController.prototype, "obter", null);
__decorate([
    (0, common_1.Get)(':id/historico'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], SolicitacoesController.prototype, "obterHistorico", null);
__decorate([
    (0, common_1.Post)(':id/comentarios'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, dto_1.AdicionarComentarioDto, Object]),
    __metadata("design:returntype", Promise)
], SolicitacoesController.prototype, "adicionarComentario", null);
__decorate([
    (0, common_1.Patch)(':id/resolver'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], SolicitacoesController.prototype, "marcarResolvida", null);
__decorate([
    (0, common_1.Patch)(':id/atribuir'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, dto_1.AtribuirSolicitacaoDto, Object]),
    __metadata("design:returntype", Promise)
], SolicitacoesController.prototype, "atribuir", null);
__decorate([
    (0, common_1.Post)(':id/primeira-resposta'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, dto_1.PrimeiraRespostaDto, Object]),
    __metadata("design:returntype", Promise)
], SolicitacoesController.prototype, "primeiraResposta", null);
exports.SolicitacoesController = SolicitacoesController = __decorate([
    (0, common_1.Controller)('solicitacoes'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __metadata("design:paramtypes", [solicitacoes_service_1.SolicitacoesService])
], SolicitacoesController);
//# sourceMappingURL=solicitacoes.controller.js.map