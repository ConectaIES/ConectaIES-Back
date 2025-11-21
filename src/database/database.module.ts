import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { User, Solicitacao, Anexo, EventoHistorico } from './entities';

@Module({
  imports: [
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => {
        const dbConfig = {
          type: 'mssql' as const,
          host: configService.get('DB_HOST') || 'localhost',
          port: parseInt(configService.get('DB_PORT') || '1433', 10),
          username: configService.get('DB_USER') || 'sa',
          password: configService.get('DB_PASSWORD') || '',
          database: configService.get('DB_NAME') || 'conecta_ies',
          entities: [User, Solicitacao, Anexo, EventoHistorico],
          synchronize: true, // Apenas para desenvolvimento! Mudar para false em produção
          logging: true,
          options: {
            encrypt: false, // Para SQL Server local
            trustServerCertificate: true, // Para desenvolvimento
          },
        };
        
        console.log('🔧 TypeORM Config:', {
          type: dbConfig.type,
          host: dbConfig.host,
          port: dbConfig.port,
          database: dbConfig.database,
          username: dbConfig.username,
          hasPassword: !!dbConfig.password,
        });
        
        return dbConfig;
      },
      inject: [ConfigService],
    }),
  ],
})
export class DatabaseModule {}
