import { User } from './user.entity';
import { Anexo } from './anexo.entity';
import { EventoHistorico } from './evento-historico.entity';
export declare enum TipoSolicitacao {
    APOIO_LOCOMOCAO = "APOIO_LOCOMOCAO",
    INTERPRETACAO_LIBRAS = "INTERPRETACAO_LIBRAS",
    OUTROS = "OUTROS"
}
export declare enum StatusSolicitacao {
    ABERTO = "ABERTO",
    NAO_VISTO = "NAO_VISTO",
    EM_ANALISE = "EM_ANALISE",
    EM_EXECUCAO = "EM_EXECUCAO",
    RESOLVIDO = "RESOLVIDO"
}
export declare class Solicitacao {
    id: number;
    protocolo: string;
    titulo: string;
    descricao: string;
    tipo: TipoSolicitacao;
    status: StatusSolicitacao;
    usuarioId: number;
    usuario: User;
    createdAt: Date;
    updatedAt: Date;
    firstResponseAt: Date;
    anexos: Anexo[];
    eventos: EventoHistorico[];
    timeToTmrBreach?: number;
}
