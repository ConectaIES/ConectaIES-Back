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
    origin: (origin, callback) => {
      const allowedOrigins = [
        'https://conecta-iesrg66.vercel.app',
        'http://localhost:4200',
        frontendUrl,
      ];
      
      // Aceitar qualquer URL do Vercel (preview deployments)
      const isVercelApp = origin && origin.includes('vercel.app');
      
      if (!origin || allowedOrigins.includes(origin) || isVercelApp) {
        callback(null, true);
      } else {
        callback(new Error('Not allowed by CORS'));
      }
    },
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
