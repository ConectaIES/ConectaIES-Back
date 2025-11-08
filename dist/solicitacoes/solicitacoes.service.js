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
exports.SolicitacoesService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const entities_1 = require("../database/entities");
const websocket_gateway_1 = require("../websocket/websocket.gateway");
let SolicitacoesService = class SolicitacoesService {
    solicitacaoRepository;
    anexoRepository;
    eventoRepository;
    websocketGateway;
    constructor(solicitacaoRepository, anexoRepository, eventoRepository, websocketGateway) {
        this.solicitacaoRepository = solicitacaoRepository;
        this.anexoRepository = anexoRepository;
        this.eventoRepository = eventoRepository;
        this.websocketGateway = websocketGateway;
    }
    async criar(dto, usuarioId, files) {
        const protocolo = await this.gerarProtocolo();
        const solicitacao = this.solicitacaoRepository.create({
            protocolo,
            titulo: dto.titulo,
            descricao: dto.descricao,
            tipo: dto.tipo,
            status: entities_1.StatusSolicitacao.ABERTO,
            usuarioId,
        });
        await this.solicitacaoRepository.save(solicitacao);
        if (files && files.length > 0) {
            for (const file of files) {
                const anexo = this.anexoRepository.create({
                    solicitacaoId: solicitacao.id,
                    nome: file.originalname,
                    url: `http://localhost:3000/uploads/${file.filename}`,
                    tipo: file.mimetype,
                });
                await this.anexoRepository.save(anexo);
            }
        }
        await this.criarEvento(solicitacao.id, entities_1.TipoEvento.STATUS_CHANGE, 'Solicitação criada', usuarioId);
        const solicitacaoCompleta = await this.obterPorId(solicitacao.id);
        this.websocketGateway.emitirNovaSolicitacao(solicitacaoCompleta);
        return solicitacaoCompleta;
    }
    async listarMinhas(usuarioId) {
        const solicitacoes = await this.solicitacaoRepository.find({
            where: { usuarioId },
            relations: ['usuario', 'anexos'],
            order: { createdAt: 'DESC' },
        });
        return solicitacoes.map((s) => this.calcularTimeToTmrBreach(s));
    }
    async obterPorId(id) {
        const solicitacao = await this.solicitacaoRepository.findOne({
            where: { id },
            relations: ['usuario', 'anexos'],
        });
        if (!solicitacao) {
            return null;
        }
        return this.calcularTimeToTmrBreach(solicitacao);
    }
    async obterHistorico(solicitacaoId) {
        const eventos = await this.eventoRepository.find({
            where: { solicitacaoId },
            relations: ['usuario'],
            order: { timestamp: 'ASC' },
        });
        return eventos.map((evento) => ({
            id: evento.id,
            solicitacaoId: evento.solicitacaoId,
            eventoTipo: evento.eventoTipo,
            descricao: evento.descricao,
            usuarioId: evento.usuarioId,
            usuarioNome: evento.usuario?.nome,
            timestamp: evento.timestamp,
        }));
    }
    async adicionarComentario(solicitacaoId, comentario, usuarioId) {
        const evento = await this.criarEvento(solicitacaoId, entities_1.TipoEvento.COMMENT, comentario, usuarioId);
        this.websocketGateway.emitirAtualizacaoStatus(solicitacaoId, 'COMMENT_ADDED');
        return evento;
    }
    async marcarResolvida(solicitacaoId, usuarioId) {
        await this.solicitacaoRepository.update(solicitacaoId, {
            status: entities_1.StatusSolicitacao.RESOLVIDO,
        });
        await this.criarEvento(solicitacaoId, entities_1.TipoEvento.STATUS_CHANGE, 'Solicitação marcada como resolvida', usuarioId);
        this.websocketGateway.emitirAtualizacaoStatus(solicitacaoId, entities_1.StatusSolicitacao.RESOLVIDO);
        return this.obterPorId(solicitacaoId);
    }
    async listarNovas() {
        const solicitacoes = await this.solicitacaoRepository.find({
            where: {
                status: (0, typeorm_2.In)([
                    entities_1.StatusSolicitacao.ABERTO,
                    entities_1.StatusSolicitacao.NAO_VISTO,
                    entities_1.StatusSolicitacao.EM_ANALISE,
                    entities_1.StatusSolicitacao.EM_EXECUCAO,
                ]),
            },
            relations: ['usuario'],
            order: { createdAt: 'DESC' },
        });
        return solicitacoes.map((s) => this.calcularTimeToTmrBreach(s));
    }
    async atribuir(solicitacaoId, usuarioIdAtribuido, nota, adminId) {
        await this.solicitacaoRepository.update(solicitacaoId, {
            status: entities_1.StatusSolicitacao.EM_ANALISE,
        });
        await this.criarEvento(solicitacaoId, entities_1.TipoEvento.STATUS_CHANGE, `Atribuído: ${nota}`, adminId);
        this.websocketGateway.emitirAtualizacaoStatus(solicitacaoId, entities_1.StatusSolicitacao.EM_ANALISE);
        return this.obterPorId(solicitacaoId);
    }
    async primeiraResposta(solicitacaoId, resposta, adminId) {
        await this.solicitacaoRepository.update(solicitacaoId, {
            status: entities_1.StatusSolicitacao.EM_EXECUCAO,
            firstResponseAt: new Date(),
        });
        await this.criarEvento(solicitacaoId, entities_1.TipoEvento.COMMENT, `Primeira resposta: ${resposta}`, adminId);
        this.websocketGateway.emitirAtualizacaoStatus(solicitacaoId, entities_1.StatusSolicitacao.EM_EXECUCAO);
        return this.obterPorId(solicitacaoId);
    }
    async gerarProtocolo() {
        const ano = new Date().getFullYear();
        const count = await this.solicitacaoRepository
            .createQueryBuilder('s')
            .where('YEAR(s.created_at) = :ano', { ano })
            .getCount();
        const sequencial = String(count + 1).padStart(4, '0');
        return `SOL-${ano}-${sequencial}`;
    }
    async criarEvento(solicitacaoId, eventoTipo, descricao, usuarioId) {
        const evento = this.eventoRepository.create({
            solicitacaoId,
            eventoTipo,
            descricao,
            usuarioId,
        });
        return this.eventoRepository.save(evento);
    }
    calcularTimeToTmrBreach(solicitacao) {
        if (solicitacao.firstResponseAt) {
            return {
                ...solicitacao,
                usuarioNome: solicitacao.usuario?.nome,
                timeToTmrBreach: null,
            };
        }
        const TMR_LIMIT = 4 * 60 * 60;
        const elapsed = (Date.now() - new Date(solicitacao.createdAt).getTime()) / 1000;
        const remaining = TMR_LIMIT - elapsed;
        return {
            ...solicitacao,
            usuarioNome: solicitacao.usuario?.nome,
            timeToTmrBreach: remaining > 0 ? Math.floor(remaining) : 0,
        };
    }
};
exports.SolicitacoesService = SolicitacoesService;
exports.SolicitacoesService = SolicitacoesService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(entities_1.Solicitacao)),
    __param(1, (0, typeorm_1.InjectRepository)(entities_1.Anexo)),
    __param(2, (0, typeorm_1.InjectRepository)(entities_1.EventoHistorico)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        websocket_gateway_1.WebsocketGateway])
], SolicitacoesService);
//# sourceMappingURL=solicitacoes.service.js.map