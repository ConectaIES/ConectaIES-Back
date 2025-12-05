import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { User, Solicitacao, Anexo, EventoHistorico } from './entities';
import { SeedService } from './seed.service';

@Module({
  imports: [
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => {
        const dbConfig = {
          type: 'postgres' as const,
          host: configService.get<string>('DB_HOST'),
          port: parseInt(configService.get<string>('DB_PORT') || '5432', 10),
          username: configService.get<string>('DB_USER'),
          password: configService.get<string>('DB_PASSWORD'),
          database: configService.get<string>('DB_NAME'),
          entities: [User, Solicitacao, Anexo, EventoHistorico],
          synchronize: true, // Criar tabelas automaticamente no PostgreSQL vazio
          logging: configService.get<string>('NODE_ENV') === 'production' ? false : true,
          ssl: configService.get<string>('NODE_ENV') === 'production' 
            ? { rejectUnauthorized: false } 
            : false,
        };
        
        console.log('🔧 TypeORM Config:', {
          type: dbConfig.type,
          host: dbConfig.host,
          port: dbConfig.port,
          database: dbConfig.database,
          username: dbConfig.username,
          hasPassword: !!dbConfig.password,
          ssl: !!dbConfig.ssl,
        });
        
        return dbConfig;
      },
      inject: [ConfigService],
    }),
    TypeOrmModule.forFeature([User, Solicitacao, Anexo, EventoHistorico]),
  ],
  providers: [SeedService],
  exports: [TypeOrmModule],
})
export class DatabaseModule {}
