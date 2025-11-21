import { TipoPerfil } from '../../database/entities';
export declare class UsuarioResponseDto {
    id: number;
    nome: string;
    email: string;
    tipoPerfil: TipoPerfil;
    matricula?: string;
    createdAt?: Date;
}
export declare class AuthResponseDto {
    token: string;
    usuario: UsuarioResponseDto;
}
