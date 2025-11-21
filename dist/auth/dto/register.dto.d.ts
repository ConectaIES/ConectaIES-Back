import { TipoPerfil } from '../../database/entities';
export declare class RegisterDto {
    nome: string;
    email: string;
    senha: string;
    tipoPerfil: TipoPerfil;
    matricula?: string;
}
