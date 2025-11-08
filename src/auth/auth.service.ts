import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { User } from '../database/entities';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
    private jwtService: JwtService,
  ) {}

  async login(email: string, senha: string) {
    const user = await this.userRepository.findOne({ where: { email } });

    if (!user) {
      throw new UnauthorizedException('Credenciais inválidas');
    }

    const senhaValida = await bcrypt.compare(senha, user.senhaHash);

    if (!senhaValida) {
      throw new UnauthorizedException('Credenciais inválidas');
    }

    const payload = {
      email: user.email,
      sub: user.id,
      tipoPerfil: user.tipoPerfil,
    };

    return {
      access_token: this.jwtService.sign(payload),
      user: {
        id: user.id,
        nome: user.nome,
        email: user.email,
        tipoPerfil: user.tipoPerfil,
      },
    };
  }

  async register(
    nome: string,
    email: string,
    senha: string,
    tipoPerfil: string,
  ) {
    const existingUser = await this.userRepository.findOne({
      where: { email },
    });

    if (existingUser) {
      throw new UnauthorizedException('E-mail já cadastrado');
    }

    const senhaHash = await bcrypt.hash(senha, 10);

    const user = this.userRepository.create({
      nome,
      email,
      senhaHash,
      tipoPerfil: tipoPerfil as any,
    });

    await this.userRepository.save(user);

    return this.login(email, senha);
  }
}
