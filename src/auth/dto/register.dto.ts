import {
  IsEmail,
  IsNotEmpty,
  IsString,
  MinLength,
  IsEnum,
  IsOptional,
} from 'class-validator';
import { TipoPerfil } from '../../database/entities';

export class RegisterDto {
  @IsString({ message: 'Nome deve ser uma string' })
  @IsNotEmpty({ message: 'Nome é obrigatório' })
  @MinLength(3, { message: 'Nome deve ter no mínimo 3 caracteres' })
  nome: string;

  @IsEmail({}, { message: 'E-mail inválido' })
  @IsNotEmpty({ message: 'E-mail é obrigatório' })
  email: string;

  @IsString({ message: 'Senha deve ser uma string' })
  @IsNotEmpty({ message: 'Senha é obrigatória' })
  @MinLength(6, { message: 'Senha deve ter no mínimo 6 caracteres' })
  senha: string;

  @IsEnum(TipoPerfil, { message: 'Tipo de perfil inválido' })
  @IsNotEmpty({ message: 'Tipo de perfil é obrigatório' })
  tipoPerfil: TipoPerfil;

  @IsOptional()
  @IsString({ message: 'Matrícula deve ser uma string' })
  matricula?: string;
}
