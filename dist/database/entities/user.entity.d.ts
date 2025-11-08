import { Solicitacao } from './solicitacao.entity';
import { EventoHistorico } from './evento-historico.entity';
export declare enum TipoPerfil {
    ALUNO = "ALUNO",
    PROFESSOR = "PROFESSOR",
    ADMIN = "ADMIN"
}
export declare class User {
    id: number;
    nome: string;
    email: string;
    senhaHash: string;
    tipoPerfil: TipoPerfil;
    createdAt: Date;
    updatedAt: Date;
    solicitacoes: Solicitacao[];
    eventos: EventoHistorico[];
}
