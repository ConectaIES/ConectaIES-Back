import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User, TipoPerfil } from '../database/entities';

interface JwtPayload {
  email: string;
  sub: number;
  tipoPerfil: TipoPerfil;
}

export interface RequestUser {
  id: number;
  nome: string;
  email: string;
  tipoPerfil: TipoPerfil;
}

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    private configService: ConfigService,
    @InjectRepository(User)
    private userRepository: Repository<User>,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: configService.get('JWT_SECRET') || 'default-secret',
    });
  }

  async validate(payload: JwtPayload): Promise<RequestUser> {
    const user = await this.userRepository.findOne({
      where: { id: payload.sub },
    });

    if (!user) {
      throw new UnauthorizedException('Usuário não encontrado');
    }

    return {
      id: user.id,
      nome: user.nome,
      email: user.email,
      tipoPerfil: user.tipoPerfil,
    };
  }
}
