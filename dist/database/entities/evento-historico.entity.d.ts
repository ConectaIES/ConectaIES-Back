import { Solicitacao } from './solicitacao.entity';
import { User } from './user.entity';
export declare enum TipoEvento {
    STATUS_CHANGE = "STATUS_CHANGE",
    COMMENT = "COMMENT",
    ATTACHMENT = "ATTACHMENT"
}
export declare class EventoHistorico {
    id: number;
    solicitacaoId: number;
    solicitacao: Solicitacao;
    eventoTipo: TipoEvento;
    descricao: string;
    usuarioId: number;
    usuario: User;
    timestamp: Date;
}
