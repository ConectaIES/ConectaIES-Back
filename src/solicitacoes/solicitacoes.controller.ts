import {
  Controller,
  Get,
  Post,
  Patch,
  Body,
  Param,
  UseGuards,
  Request,
  UseInterceptors,
  UploadedFiles,
  BadRequestException,
  ForbiddenException,
} from '@nestjs/common';
import { FilesInterceptor } from '@nestjs/platform-express';
import { Multer } from 'multer';
import { diskStorage } from 'multer';
import { extname } from 'path';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RequestUser } from '../auth/jwt.strategy';
import { SolicitacoesService } from './solicitacoes.service';
import { TipoPerfil } from '../database/entities';
import {
  CriarSolicitacaoDto,
  AdicionarComentarioDto,
  PrimeiraRespostaDto,
  AtribuirSolicitacaoDto,
} from './dto';

interface AuthenticatedRequest {
  user: RequestUser;
}

@Controller('solicitacoes')
@UseGuards(JwtAuthGuard)
export class SolicitacoesController {
  constructor(private solicitacoesService: SolicitacoesService) {}

  @Post()
  @UseInterceptors(
    FilesInterceptor('anexos', 3, {
      storage: diskStorage({
        destination: './uploads',
        filename: (req, file, cb) => {
          const randomName = Array(32)
            .fill(null)
            .map(() => Math.round(Math.random() * 16).toString(16))
            .join('');
          cb(null, `${randomName}${extname(file.originalname)}`);
        },
      }),
      limits: {
        fileSize: 5 * 1024 * 1024, // 5MB
      },
      fileFilter: (req, file, cb) => {
        const allowedTypes = [
          'image/jpeg',
          'image/png',
          'application/pdf',
          'application/msword',
          'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        ];
        if (allowedTypes.includes(file.mimetype)) {
          cb(null, true);
        } else {
          cb(new BadRequestException('Tipo de arquivo não permitido'), false);
        }
      },
    }),
  )
  async criar(
    @Body() dto: CriarSolicitacaoDto,
    @UploadedFiles() files: Multer.File[],
    @Request() req: AuthenticatedRequest,
  ) {
    if (files && files.length > 3) {
      throw new BadRequestException('Máximo de 3 anexos permitidos');
    }

    return this.solicitacoesService.criar(dto, req.user.id, files);
  }

  @Get('minhas')
  async listarMinhas(@Request() req: AuthenticatedRequest) {
    return this.solicitacoesService.listarMinhas(req.user.id);
  }

  @Get('admin/novas')
  async listarNovas(@Request() req: AuthenticatedRequest) {
    if (req.user.tipoPerfil !== TipoPerfil.ADMIN) {
      throw new ForbiddenException('Acesso negado');
    }
    return this.solicitacoesService.listarNovas();
  }

  @Get('admin/resolvidas')
  async listarResolvidas(@Request() req: AuthenticatedRequest) {
    if (req.user.tipoPerfil !== TipoPerfil.ADMIN) {
      throw new ForbiddenException('Acesso negado');
    }
    return this.solicitacoesService.listarResolvidas();
  }

  @Get(':id')
  async obter(@Param('id') id: string) {
    return this.solicitacoesService.obterPorId(+id);
  }

  @Get(':id/historico')
  async obterHistorico(@Param('id') id: string) {
    return this.solicitacoesService.obterHistorico(+id);
  }

  @Post(':id/comentarios')
  async adicionarComentario(
    @Param('id') id: string,
    @Body() dto: AdicionarComentarioDto,
    @Request() req: AuthenticatedRequest,
  ) {
    return this.solicitacoesService.adicionarComentario(
      +id,
      dto.comentario,
      req.user.id,
    );
  }

  @Patch(':id/resolver')
  async marcarResolvida(
    @Param('id') id: string,
    @Request() req: AuthenticatedRequest,
  ) {
    return this.solicitacoesService.marcarResolvida(+id, req.user.id);
  }

  @Patch(':id/atribuir')
  async atribuir(
    @Param('id') id: string,
    @Body() dto: AtribuirSolicitacaoDto,
    @Request() req: AuthenticatedRequest,
  ) {
    if (req.user.tipoPerfil !== TipoPerfil.ADMIN) {
      throw new ForbiddenException('Acesso negado');
    }
    return this.solicitacoesService.atribuir(
      +id,
      dto.usuarioId,
      dto.nota,
      req.user.id,
    );
  }

  @Post(':id/primeira-resposta')
  async primeiraResposta(
    @Param('id') id: string,
    @Body() dto: PrimeiraRespostaDto,
    @Request() req: AuthenticatedRequest,
  ) {
    if (req.user.tipoPerfil !== TipoPerfil.ADMIN) {
      throw new ForbiddenException('Acesso negado');
    }
    return this.solicitacoesService.primeiraResposta(
      +id,
      dto.resposta,
      req.user.id,
    );
  }
}
