import { IsString, IsNotEmpty, IsEnum } from 'class-validator';
import { TipoSolicitacao } from '../../database/entities';

export class CriarSolicitacaoDto {
  @IsString()
  @IsNotEmpty()
  titulo: string;

  @IsString()
  @IsNotEmpty()
  descricao: string;

  @IsEnum(TipoSolicitacao)
  @IsNotEmpty()
  tipo: TipoSolicitacao;
}

export class AdicionarComentarioDto {
  @IsString()
  @IsNotEmpty()
  comentario: string;
}

export class PrimeiraRespostaDto {
  @IsString()
  @IsNotEmpty()
  resposta: string;
}

export class AtribuirSolicitacaoDto {
  @IsNotEmpty()
  usuarioId: number;

  @IsString()
  nota: string;
}
