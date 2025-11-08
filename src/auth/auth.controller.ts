import { Controller, Post, Body } from '@nestjs/common';
import { AuthService } from './auth.service';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('login')
  async login(@Body() body: { email: string; senha: string }) {
    return this.authService.login(body.email, body.senha);
  }

  @Post('register')
  async register(
    @Body()
    body: {
      nome: string;
      email: string;
      senha: string;
      tipoPerfil: string;
    },
  ) {
    return this.authService.register(
      body.nome,
      body.email,
      body.senha,
      body.tipoPerfil,
    );
  }
}
