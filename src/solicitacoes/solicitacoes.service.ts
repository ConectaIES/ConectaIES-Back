import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In } from 'typeorm';
import { Multer } from 'multer';
import {
  Solicitacao,
  Anexo,
  EventoHistorico,
  StatusSolicitacao,
  TipoEvento,
} from '../database/entities';
import { CriarSolicitacaoDto } from './dto';
import { WebsocketGateway } from '../websocket/websocket.gateway';

@Injectable()
export class SolicitacoesService {
  constructor(
    @InjectRepository(Solicitacao)
    private solicitacaoRepository: Repository<Solicitacao>,
    @InjectRepository(Anexo)
    private anexoRepository: Repository<Anexo>,
    @InjectRepository(EventoHistorico)
    private eventoRepository: Repository<EventoHistorico>,
    private websocketGateway: WebsocketGateway,
  ) {}

  async criar(
    dto: CriarSolicitacaoDto,
    usuarioId: number,
    files?: Multer.File[],
  ) {
    // Gerar protocolo único
    const protocolo = await this.gerarProtocolo();

    // Criar solicitação
    const solicitacao = this.solicitacaoRepository.create({
      protocolo,
      titulo: dto.titulo,
      descricao: dto.descricao,
      tipo: dto.tipo,
      status: StatusSolicitacao.ABERTO,
      usuarioId,
    });

    await this.solicitacaoRepository.save(solicitacao);

    // Processar anexos se houver
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

    // Criar evento inicial no histórico
    await this.criarEvento(
      solicitacao.id,
      TipoEvento.STATUS_CHANGE,
      'Solicitação criada',
      usuarioId,
    );

    // Buscar solicitação completa com relações
    const solicitacaoCompleta = await this.obterPorId(solicitacao.id);

    // Emitir WebSocket para admins
    if (solicitacaoCompleta) {
      this.websocketGateway.emitirNovaSolicitacao(solicitacaoCompleta);
    }

    return solicitacaoCompleta;
  }

  async listarMinhas(usuarioId: number) {
    const solicitacoes = await this.solicitacaoRepository.find({
      where: { usuarioId },
      relations: ['usuario', 'anexos'],
      order: { createdAt: 'DESC' },
    });

    return solicitacoes.map((s) => this.calcularTimeToTmrBreach(s));
  }

  async obterPorId(id: number) {
    const solicitacao = await this.solicitacaoRepository.findOne({
      where: { id },
      relations: ['usuario', 'anexos'],
    });

    if (!solicitacao) {
      return null;
    }

    return this.calcularTimeToTmrBreach(solicitacao);
  }

  async obterHistorico(solicitacaoId: number) {
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

  async adicionarComentario(
    solicitacaoId: number,
    comentario: string,
    usuarioId: number,
  ) {
    const evento = await this.criarEvento(
      solicitacaoId,
      TipoEvento.COMMENT,
      comentario,
      usuarioId,
    );

    // Emitir WebSocket
    this.websocketGateway.emitirAtualizacaoStatus(
      solicitacaoId,
      'COMMENT_ADDED',
    );

    return evento;
  }

  async marcarResolvida(solicitacaoId: number, usuarioId: number) {
    await this.solicitacaoRepository.update(solicitacaoId, {
      status: StatusSolicitacao.RESOLVIDO,
    });

    await this.criarEvento(
      solicitacaoId,
      TipoEvento.STATUS_CHANGE,
      'Solicitação marcada como resolvida',
      usuarioId,
    );

    // Emitir WebSocket
    this.websocketGateway.emitirAtualizacaoStatus(
      solicitacaoId,
      StatusSolicitacao.RESOLVIDO,
    );

    return this.obterPorId(solicitacaoId);
  }

  async listarNovas() {
    const solicitacoes = await this.solicitacaoRepository.find({
      where: {
        status: In([
          StatusSolicitacao.ABERTO,
          StatusSolicitacao.NAO_VISTO,
          StatusSolicitacao.EM_ANALISE,
          StatusSolicitacao.EM_EXECUCAO,
        ]),
      },
      relations: ['usuario'],
      order: { createdAt: 'DESC' },
    });

    return solicitacoes.map((s) => this.calcularTimeToTmrBreach(s));
  }

  async listarResolvidas() {
    const solicitacoes = await this.solicitacaoRepository.find({
      where: {
        status: StatusSolicitacao.RESOLVIDO,
      },
      relations: ['usuario'],
      order: { updatedAt: 'DESC' },
    });

    return solicitacoes;
  }

  async atribuir(
    solicitacaoId: number,
    usuarioIdAtribuido: number,
    nota: string,
    adminId: number,
  ) {
    await this.solicitacaoRepository.update(solicitacaoId, {
      status: StatusSolicitacao.EM_ANALISE,
    });

    await this.criarEvento(
      solicitacaoId,
      TipoEvento.STATUS_CHANGE,
      `Atribuído: ${nota}`,
      adminId,
    );

    this.websocketGateway.emitirAtualizacaoStatus(
      solicitacaoId,
      StatusSolicitacao.EM_ANALISE,
    );

    return this.obterPorId(solicitacaoId);
  }

  async primeiraResposta(
    solicitacaoId: number,
    resposta: string,
    adminId: number,
  ) {
    // ⚠️ CRÍTICO: Atualizar first_response_at
    await this.solicitacaoRepository.update(solicitacaoId, {
      status: StatusSolicitacao.EM_EXECUCAO,
      firstResponseAt: new Date(),
    });

    await this.criarEvento(
      solicitacaoId,
      TipoEvento.COMMENT,
      `Primeira resposta: ${resposta}`,
      adminId,
    );

    this.websocketGateway.emitirAtualizacaoStatus(
      solicitacaoId,
      StatusSolicitacao.EM_EXECUCAO,
    );

    return this.obterPorId(solicitacaoId);
  }

  // UTILITÁRIOS

  private async gerarProtocolo(): Promise<string> {
    const ano = new Date().getFullYear();
    const count = await this.solicitacaoRepository
      .createQueryBuilder('s')
      .where('YEAR(s.created_at) = :ano', { ano })
      .getCount();

    const sequencial = String(count + 1).padStart(4, '0');
    return `SOL-${ano}-${sequencial}`;
  }

  private async criarEvento(
    solicitacaoId: number,
    eventoTipo: TipoEvento,
    descricao: string,
    usuarioId: number,
  ) {
    const evento = this.eventoRepository.create({
      solicitacaoId,
      eventoTipo,
      descricao,
      usuarioId,
    });

    return this.eventoRepository.save(evento);
  }

  private calcularTimeToTmrBreach(solicitacao: Solicitacao): any {
    // Se já teve primeira resposta, retorna null
    if (solicitacao.firstResponseAt) {
      return {
        ...solicitacao,
        usuarioNome: solicitacao.usuario?.nome,
        timeToTmrBreach: null,
      };
    }

    const TMR_LIMIT = 4 * 60 * 60; // 4 horas em segundos
    const elapsed =
      (Date.now() - new Date(solicitacao.createdAt).getTime()) / 1000;
    const remaining = TMR_LIMIT - elapsed;

    return {
      ...solicitacao,
      usuarioNome: solicitacao.usuario?.nome,
      timeToTmrBreach: remaining > 0 ? Math.floor(remaining) : 0,
    };
  }
}
