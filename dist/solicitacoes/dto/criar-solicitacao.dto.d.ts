import { TipoSolicitacao } from '../../database/entities';
export declare class CriarSolicitacaoDto {
    titulo: string;
    descricao: string;
    tipo: TipoSolicitacao;
}
export declare class AdicionarComentarioDto {
    comentario: string;
}
export declare class PrimeiraRespostaDto {
    resposta: string;
}
export declare class AtribuirSolicitacaoDto {
    usuarioId: number;
    nota: string;
}
