import { TipoPerfil } from '../../database/entities';

export class UsuarioResponseDto {
  id: number;
  nome: string;
  email: string;
  tipoPerfil: TipoPerfil;
  matricula?: string;
  createdAt?: Date;
}

export class AuthResponseDto {
  token: string;
  usuario: UsuarioResponseDto;
}
