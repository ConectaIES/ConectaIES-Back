import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // CORS para o front-end Angular
  app.enableCors({
    origin: 'http://localhost:4200',
    credentials: true,
  });

  // Validação global
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
    }),
  );

  // Prefixo global da API
  app.setGlobalPrefix('api');

  await app.listen(3000);
  console.log('🚀 Servidor rodando em http://localhost:3000');
  console.log('🔌 WebSocket disponível em ws://localhost:3000');
}
void bootstrap();
