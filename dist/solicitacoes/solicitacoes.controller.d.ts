import { SolicitacoesService } from './solicitacoes.service';
import { CriarSolicitacaoDto, AdicionarComentarioDto, PrimeiraRespostaDto, AtribuirSolicitacaoDto } from './dto';
export declare class SolicitacoesController {
    private solicitacoesService;
    constructor(solicitacoesService: SolicitacoesService);
    criar(dto: CriarSolicitacaoDto, files: Express.Multer.File[], req: any): Promise<any>;
    listarMinhas(req: any): Promise<any[]>;
    listarNovas(req: any): Promise<any[]>;
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
    adicionarComentario(id: string, dto: AdicionarComentarioDto, req: any): Promise<import("../database/entities").EventoHistorico>;
    marcarResolvida(id: string, req: any): Promise<any>;
    atribuir(id: string, dto: AtribuirSolicitacaoDto, req: any): Promise<any>;
    primeiraResposta(id: string, dto: PrimeiraRespostaDto, req: any): Promise<any>;
}
