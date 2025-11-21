import {
  Injectable,
  UnauthorizedException,
  ConflictException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { User } from '../database/entities';
import { LoginDto, RegisterDto, AuthResponseDto } from './dto';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
    private jwtService: JwtService,
  ) {}

  async login(loginDto: LoginDto): Promise<AuthResponseDto> {
    const user = await this.userRepository.findOne({
      where: { email: loginDto.email },
    });

    if (!user) {
      throw new UnauthorizedException('Credenciais inválidas');
    }

    const senhaValida = await bcrypt.compare(loginDto.senha, user.senhaHash);

    if (!senhaValida) {
      throw new UnauthorizedException('Credenciais inválidas');
    }

    const payload = {
      email: user.email,
      sub: user.id,
      tipoPerfil: user.tipoPerfil,
    };

    return {
      token: this.jwtService.sign(payload),
      usuario: {
        id: user.id,
        nome: user.nome,
        email: user.email,
        tipoPerfil: user.tipoPerfil,
        matricula: user.matricula,
        createdAt: user.createdAt,
      },
    };
  }

  async register(registerDto: RegisterDto): Promise<AuthResponseDto> {
    const existingUser = await this.userRepository.findOne({
      where: { email: registerDto.email },
    });

    if (existingUser) {
      throw new ConflictException('E-mail já cadastrado');
    }

    const senhaHash = await bcrypt.hash(registerDto.senha, 10);

    const user = this.userRepository.create({
      nome: registerDto.nome,
      email: registerDto.email,
      senhaHash,
      tipoPerfil: registerDto.tipoPerfil,
      matricula: registerDto.matricula,
    });

    await this.userRepository.save(user);

    // Retornar login automático
    return this.login({
      email: registerDto.email,
      senha: registerDto.senha,
    });
  }
}
