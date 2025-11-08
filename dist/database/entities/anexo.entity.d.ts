import { Solicitacao } from './solicitacao.entity';
export declare class Anexo {
    id: number;
    solicitacaoId: number;
    solicitacao: Solicitacao;
    nome: string;
    url: string;
    tipo: string;
    createdAt: Date;
}
