import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { AppModule } from './app.module';
import { ConfigService } from '@nestjs/config';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  
  const configService = app.get(ConfigService);
  const frontendUrl = configService.get<string>('FRONTEND_URL');
  
  // CORS para o front-end Angular
  app.enableCors({
    origin: [
      'https://conecta-iesrg66.vercel.app',
      'https://conecta-ies-front-rg66-l3m24f6oi-mister-guedes-projects.vercel.app',
      'http://localhost:4200',
      frontendUrl || 'http://localhost:4200',
    ],
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  });

  // Validação global
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  // Prefixo global da API
  app.setGlobalPrefix('api');

  const port = configService.get<number>('PORT') || 3000;
  await app.listen(port, '0.0.0.0');
  
  console.log(`🚀 Servidor rodando na porta ${port}`);
  console.log(`🌍 Ambiente: ${configService.get<string>('NODE_ENV')}`);
  console.log(`🔌 WebSocket disponível`);
}
void bootstrap();
