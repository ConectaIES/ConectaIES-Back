import { RequestUser } from '../auth/jwt.strategy';
import { SolicitacoesService } from './solicitacoes.service';
import { CriarSolicitacaoDto, AdicionarComentarioDto, PrimeiraRespostaDto, AtribuirSolicitacaoDto } from './dto';
interface AuthenticatedRequest {
    user: RequestUser;
}
export declare class SolicitacoesController {
    private solicitacoesService;
    constructor(solicitacoesService: SolicitacoesService);
    criar(dto: CriarSolicitacaoDto, files: Express.Multer.File[], req: AuthenticatedRequest): Promise<any>;
    listarMinhas(req: AuthenticatedRequest): Promise<any[]>;
    listarNovas(req: AuthenticatedRequest): Promise<any[]>;
    listarResolvidas(req: AuthenticatedRequest): Promise<import("../database/entities").Solicitacao[]>;
    obter(id: string): Promise<any>;
    obterHistorico(id: string): Promise<{
        id: number;
        solicitacaoId: number;
        eventoTipo: import("../database/entities").TipoEvento;
        descricao: string;
        usuarioId: number;
        usuarioNome: string;
        timestamp: Date;
    }[]>;
    adicionarComentario(id: string, dto: AdicionarComentarioDto, req: AuthenticatedRequest): Promise<import("../database/entities").EventoHistorico>;
    marcarResolvida(id: string, req: AuthenticatedRequest): Promise<any>;
    atribuir(id: string, dto: AtribuirSolicitacaoDto, req: AuthenticatedRequest): Promise<any>;
    primeiraResposta(id: string, dto: PrimeiraRespostaDto, req: AuthenticatedRequest): Promise<any>;
}
export {};
