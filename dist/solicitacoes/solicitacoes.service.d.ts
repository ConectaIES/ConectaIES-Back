import { Repository } from 'typeorm';
import { Solicitacao, Anexo, EventoHistorico, TipoEvento } from '../database/entities';
import { CriarSolicitacaoDto } from './dto';
import { WebsocketGateway } from '../websocket/websocket.gateway';
export declare class SolicitacoesService {
    private solicitacaoRepository;
    private anexoRepository;
    private eventoRepository;
    private websocketGateway;
    constructor(solicitacaoRepository: Repository<Solicitacao>, anexoRepository: Repository<Anexo>, eventoRepository: Repository<EventoHistorico>, websocketGateway: WebsocketGateway);
    criar(dto: CriarSolicitacaoDto, usuarioId: number, files?: Express.Multer.File[]): Promise<any>;
    listarMinhas(usuarioId: number): Promise<any[]>;
    obterPorId(id: number): Promise<any>;
    obterHistorico(solicitacaoId: number): Promise<{
        id: number;
        solicitacaoId: number;
        eventoTipo: TipoEvento;
        descricao: string;
        usuarioId: number;
        usuarioNome: string;
        timestamp: Date;
    }[]>;
    adicionarComentario(solicitacaoId: number, comentario: string, usuarioId: number): Promise<EventoHistorico>;
    marcarResolvida(solicitacaoId: number, usuarioId: number): Promise<any>;
    listarNovas(): Promise<any[]>;
    atribuir(solicitacaoId: number, usuarioIdAtribuido: number, nota: string, adminId: number): Promise<any>;
    primeiraResposta(solicitacaoId: number, resposta: string, adminId: number): Promise<any>;
    private gerarProtocolo;
    private criarEvento;
    private calcularTimeToTmrBreach;
}
