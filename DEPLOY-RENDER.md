# 🚀 Guia Completo - Deploy Backend NestJS no Render com PostgreSQL

## 📋 Visão Geral

Este guia cobre:
1. ✅ Migração de SQL Server/MySQL para PostgreSQL
2. ✅ Configuração do TypeORM para PostgreSQL
3. ✅ Criação de usuário admin padrão
4. ✅ Deploy no Render
5. ✅ Conexão com o frontend no Vercel

---

## 🎯 ETAPA 1: Preparar o Projeto para PostgreSQL

### 1.1 Instalar Dependências do PostgreSQL

```bash
cd ConectaIES-Back
npm install pg --save
npm install @types/pg --save-dev
```

**Remover** dependências antigas (SQL Server):
```bash
npm uninstall mssql
```

### 1.2 Atualizar package.json

O `package.json` deve ter:
```json
{
  "dependencies": {
    "pg": "^8.13.1",
    "typeorm": "^0.3.27",
    "@nestjs/typeorm": "^11.0.0"
  }
}
```

---

## 🔧 ETAPA 2: Migrar Código para PostgreSQL

### 2.1 Atualizar database.module.ts

**Arquivo:** `src/database/database.module.ts`

```typescript
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { User, Solicitacao, Anexo, EventoHistorico } from './entities';

@Module({
  imports: [
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => ({
        type: 'postgres',
        host: configService.get<string>('DB_HOST'),
        port: parseInt(configService.get<string>('DB_PORT') || '5432', 10),
        username: configService.get<string>('DB_USER'),
        password: configService.get<string>('DB_PASSWORD'),
        database: configService.get<string>('DB_NAME'),
        entities: [User, Solicitacao, Anexo, EventoHistorico],
        synchronize: true, // ⚠️ TRUE para criar tabelas automaticamente
        logging: ['error', 'warn', 'schema'],
        ssl: configService.get<string>('NODE_ENV') === 'production' 
          ? { rejectUnauthorized: false } 
          : false,
      }),
      inject: [ConfigService],
    }),
  ],
})
export class DatabaseModule {}
```

**⚠️ IMPORTANTE:** `synchronize: true` vai **criar automaticamente** todas as tabelas no PostgreSQL vazio.

### 2.2 Ajustar Entities para PostgreSQL

#### user.entity.ts

Substituir tipos específicos do SQL Server:

```typescript
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
} from 'typeorm';
import { Solicitacao } from './solicitacao.entity';
import { EventoHistorico } from './evento-historico.entity';

export enum TipoPerfil {
  ALUNO = 'ALUNO',
  PROFESSOR = 'PROFESSOR',
  ADMIN = 'ADMIN',
}

@Entity('users')
export class User {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'varchar', length: 200 })
  nome: string;

  @Column({ type: 'varchar', length: 200, unique: true })
  email: string;

  @Column({ type: 'varchar', length: 255, name: 'senha_hash' })
  senhaHash: string;

  @Column({
    type: 'enum',
    enum: TipoPerfil,
    name: 'tipo_perfil',
  })
  tipoPerfil: TipoPerfil;

  @Column({ type: 'varchar', length: 50, nullable: true })
  matricula: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  @OneToMany(() => Solicitacao, (solicitacao) => solicitacao.usuario)
  solicitacoes: Solicitacao[];

  @OneToMany(() => EventoHistorico, (evento) => evento.usuario)
  eventosHistorico: EventoHistorico[];
}
```

#### solicitacao.entity.ts

```typescript
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  OneToMany,
  JoinColumn,
} from 'typeorm';
import { User } from './user.entity';
import { Anexo } from './anexo.entity';
import { EventoHistorico } from './evento-historico.entity';

export enum TipoSolicitacao {
  CHAMADO = 'CHAMADO',
  REPORTAR_PROBLEMA = 'REPORTAR_PROBLEMA',
  SUGESTAO_MELHORIA = 'SUGESTAO_MELHORIA',
  SOLICITAR_APOIO = 'SOLICITAR_APOIO',
}

export enum StatusSolicitacao {
  PENDENTE = 'PENDENTE',
  EM_ANDAMENTO = 'EM_ANDAMENTO',
  RESOLVIDA = 'RESOLVIDA',
  CANCELADA = 'CANCELADA',
}

export enum PrioridadeSolicitacao {
  BAIXA = 'BAIXA',
  MEDIA = 'MEDIA',
  ALTA = 'ALTA',
  URGENTE = 'URGENTE',
}

@Entity('solicitacoes')
export class Solicitacao {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'enum', enum: TipoSolicitacao, name: 'tipo_solicitacao' })
  tipoSolicitacao: TipoSolicitacao;

  @Column({ type: 'varchar', length: 300 })
  titulo: string;

  @Column({ type: 'text' })
  descricao: string;

  @Column({ type: 'enum', enum: StatusSolicitacao, default: StatusSolicitacao.PENDENTE })
  status: StatusSolicitacao;

  @Column({ type: 'enum', enum: PrioridadeSolicitacao, default: PrioridadeSolicitacao.MEDIA })
  prioridade: PrioridadeSolicitacao;

  @Column({ type: 'varchar', length: 100, nullable: true })
  localizacao: string;

  @Column({ type: 'int', name: 'usuario_id' })
  usuarioId: number;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  @ManyToOne(() => User, (user) => user.solicitacoes)
  @JoinColumn({ name: 'usuario_id' })
  usuario: User;

  @OneToMany(() => Anexo, (anexo) => anexo.solicitacao, { cascade: true })
  anexos: Anexo[];

  @OneToMany(() => EventoHistorico, (evento) => evento.solicitacao, { cascade: true })
  eventosHistorico: EventoHistorico[];
}
```

#### anexo.entity.ts

```typescript
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Solicitacao } from './solicitacao.entity';

@Entity('anexos')
export class Anexo {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'varchar', length: 255, name: 'nome_arquivo' })
  nomeArquivo: string;

  @Column({ type: 'varchar', length: 500, name: 'caminho_arquivo' })
  caminhoArquivo: string;

  @Column({ type: 'varchar', length: 50, name: 'tipo_arquivo' })
  tipoArquivo: string;

  @Column({ type: 'int', name: 'tamanho_bytes' })
  tamanhoBytes: number;

  @Column({ type: 'int', name: 'solicitacao_id' })
  solicitacaoId: number;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @ManyToOne(() => Solicitacao, (solicitacao) => solicitacao.anexos, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'solicitacao_id' })
  solicitacao: Solicitacao;
}
```

#### evento-historico.entity.ts

```typescript
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Solicitacao } from './solicitacao.entity';
import { User } from './user.entity';

export enum TipoEvento {
  CRIACAO = 'CRIACAO',
  ATUALIZACAO_STATUS = 'ATUALIZACAO_STATUS',
  COMENTARIO = 'COMENTARIO',
  ANEXO_ADICIONADO = 'ANEXO_ADICIONADO',
}

@Entity('eventos_historico')
export class EventoHistorico {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'int', name: 'solicitacao_id' })
  solicitacaoId: number;

  @Column({ type: 'int', name: 'usuario_id' })
  usuarioId: number;

  @Column({ type: 'enum', enum: TipoEvento, name: 'tipo_evento' })
  tipoEvento: TipoEvento;

  @Column({ type: 'text' })
  descricao: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @ManyToOne(() => Solicitacao, (solicitacao) => solicitacao.eventosHistorico, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'solicitacao_id' })
  solicitacao: Solicitacao;

  @ManyToOne(() => User, (user) => user.eventosHistorico)
  @JoinColumn({ name: 'usuario_id' })
  usuario: User;
}
```

---

## 👤 ETAPA 3: Criar Usuário Admin Automaticamente

### 3.1 Criar Serviço de Seed

**Arquivo:** `src/database/seed.service.ts`

```typescript
import { Injectable, OnModuleInit } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User, TipoPerfil } from './entities/user.entity';
import * as bcrypt from 'bcrypt';

@Injectable()
export class SeedService implements OnModuleInit {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
  ) {}

  async onModuleInit() {
    await this.createAdminUser();
  }

  private async createAdminUser() {
    try {
      const adminEmail = 'admin@conectaies.com';
      
      // Verificar se já existe
      const existingAdmin = await this.userRepository.findOne({
        where: { email: adminEmail },
      });

      if (existingAdmin) {
        console.log('✅ Usuário admin já existe');
        return;
      }

      // Criar usuário admin
      const hashedPassword = await bcrypt.hash('Admin@123', 10);
      
      const admin = this.userRepository.create({
        nome: 'Administrador',
        email: adminEmail,
        senhaHash: hashedPassword,
        tipoPerfil: TipoPerfil.ADMIN,
        matricula: null,
      });

      await this.userRepository.save(admin);
      
      console.log('🎉 Usuário admin criado com sucesso!');
      console.log('📧 Email: admin@conectaies.com');
      console.log('🔑 Senha: Admin@123');
    } catch (error) {
      console.error('❌ Erro ao criar admin:', error.message);
    }
  }
}
```

### 3.2 Registrar SeedService no DatabaseModule

**Atualizar:** `src/database/database.module.ts`

```typescript
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { User, Solicitacao, Anexo, EventoHistorico } from './entities';
import { SeedService } from './seed.service';

@Module({
  imports: [
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => ({
        type: 'postgres',
        host: configService.get<string>('DB_HOST'),
        port: parseInt(configService.get<string>('DB_PORT') || '5432', 10),
        username: configService.get<string>('DB_USER'),
        password: configService.get<string>('DB_PASSWORD'),
        database: configService.get<string>('DB_NAME'),
        entities: [User, Solicitacao, Anexo, EventoHistorico],
        synchronize: true,
        logging: ['error', 'warn', 'schema'],
        ssl: configService.get<string>('NODE_ENV') === 'production' 
          ? { rejectUnauthorized: false } 
          : false,
      }),
      inject: [ConfigService],
    }),
    TypeOrmModule.forFeature([User, Solicitacao, Anexo, EventoHistorico]),
  ],
  providers: [SeedService],
  exports: [TypeOrmModule],
})
export class DatabaseModule {}
```

---

## 🔐 ETAPA 4: Configurar Variáveis de Ambiente

### 4.1 Atualizar .env.example

```env
# Application
NODE_ENV=production
PORT=3000

# Database PostgreSQL (será preenchido pelo Render)
DB_HOST=
DB_PORT=5432
DB_USER=
DB_PASSWORD=
DB_NAME=

# JWT
JWT_SECRET=sua_chave_secreta_super_segura_aqui_123456
JWT_EXPIRATION=7d

# CORS (Frontend Vercel)
FRONTEND_URL=https://seu-app.vercel.app
```

### 4.2 Atualizar main.ts para CORS

**Arquivo:** `src/main.ts`

```typescript
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  
  const configService = app.get(ConfigService);
  
  // CORS
  app.enableCors({
    origin: [
      configService.get<string>('FRONTEND_URL'),
      'http://localhost:4200', // Desenvolvimento
    ],
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  });

  // Validation
  app.useGlobalPipes(new ValidationPipe({
    whitelist: true,
    forbidNonWhitelisted: true,
    transform: true,
  }));

  const port = configService.get<number>('PORT') || 3000;
  await app.listen(port, '0.0.0.0');
  
  console.log(`🚀 Aplicação rodando na porta ${port}`);
  console.log(`🌍 Ambiente: ${configService.get<string>('NODE_ENV')}`);
}
bootstrap();
```

---

## 📦 ETAPA 5: Deploy no Render

### 5.1 Preparar Projeto para Git

```bash
cd ConectaIES-Back

# Garantir que .gitignore está correto
echo "node_modules/" >> .gitignore
echo ".env" >> .gitignore
echo "dist/" >> .gitignore

git add .
git commit -m "feat: migrar para PostgreSQL e preparar para Render"
```

### 5.2 Criar Repositório no GitHub

1. Acesse https://github.com/new
2. Nome: `ConectaIES-Back`
3. **NÃO** inicialize com README
4. Clique em **Create repository**

```bash
git remote add origin https://github.com/SEU-USUARIO/ConectaIES-Back.git
git branch -M main
git push -u origin main
```

### 5.3 Criar Conta no Render

1. Acesse https://render.com
2. Faça login com GitHub
3. Autorize o Render a acessar seus repositórios

### 5.4 Criar PostgreSQL Database

1. No Dashboard do Render → **New** → **PostgreSQL**
2. **Name:** `conectaies-db`
3. **Database:** `conecta_ies`
4. **User:** (gerado automaticamente)
5. **Region:** `Oregon (US West)` ou mais próximo
6. **Plan:** **Free** (90 dias grátis, depois $7/mês)
7. Clique em **Create Database**

⏳ **Aguarde 2-5 minutos** para o banco ser criado.

8. Quando pronto, você verá:
   - **Internal Database URL** (para usar no backend)
   - **External Database URL** (para acessar externamente)

📋 **Copie a "Internal Database URL"** - será algo como:
```
postgresql://user:password@dpg-xxxxx-a/conecta_ies
```

### 5.5 Criar Web Service (Backend)

1. No Dashboard → **New** → **Web Service**
2. Conecte ao repositório `ConectaIES-Back`
3. Configure:

**Configurações Básicas:**
- **Name:** `conectaies-backend`
- **Region:** Mesma do banco (Oregon)
- **Branch:** `main`
- **Root Directory:** (deixe vazio)
- **Runtime:** `Node`
- **Build Command:** `npm install && npm run build`
- **Start Command:** `npm run start:prod`
- **Plan:** **Free**

**Environment Variables:**

Clique em **Add Environment Variable** e adicione:

| Key | Value |
|-----|-------|
| `NODE_ENV` | `production` |
| `PORT` | `3000` |
| `DATABASE_URL` | (Cole a Internal Database URL) |
| `DB_HOST` | (extrair do DATABASE_URL) |
| `DB_PORT` | `5432` |
| `DB_USER` | (extrair do DATABASE_URL) |
| `DB_PASSWORD` | (extrair do DATABASE_URL) |
| `DB_NAME` | `conecta_ies` |
| `JWT_SECRET` | `sua_chave_super_secreta_123456` |
| `JWT_EXPIRATION` | `7d` |
| `FRONTEND_URL` | `https://seu-app.vercel.app` |

⚠️ **Dica:** Para extrair credenciais do `DATABASE_URL`:
```
postgresql://USER:PASSWORD@HOST/DATABASE
```

4. Clique em **Create Web Service**

### 5.6 Aguardar Deploy

O Render vai:
1. ✅ Clonar repositório
2. ✅ Instalar dependências (`npm install`)
3. ✅ Build do projeto (`npm run build`)
4. ✅ Iniciar aplicação (`npm run start:prod`)
5. ✅ TypeORM criar tabelas automaticamente (`synchronize: true`)
6. ✅ SeedService criar usuário admin

⏳ **Tempo estimado:** 5-10 minutos

---

## ✅ ETAPA 6: Verificar Deploy

### 6.1 Verificar Logs

No Render Dashboard → **Logs**, você deve ver:

```
🚀 Aplicação rodando na porta 3000
🌍 Ambiente: production
🔧 TypeORM Config: { type: 'postgres', host: 'dpg-xxxxx', ... }
✅ Usuário admin já existe (ou criado)
```

### 6.2 Testar API

Sua API estará em:
```
https://conectaies-backend.onrender.com
```

Teste no navegador ou Postman:
```
GET https://conectaies-backend.onrender.com
```

Deve retornar: `"ConectaIES API - Sistema de Gestão de Acessibilidade"`

### 6.3 Testar Login Admin

```bash
POST https://conectaies-backend.onrender.com/auth/login
Content-Type: application/json

{
  "email": "admin@conectaies.com",
  "password": "Admin@123"
}
```

Deve retornar token JWT.

---

## 🔗 ETAPA 7: Conectar Frontend (Vercel) com Backend (Render)

### 7.1 Atualizar Variáveis de Ambiente no Vercel

1. Acesse Vercel Dashboard
2. Vá em **Settings** → **Environment Variables**
3. Adicione:

| Key | Value |
|-----|-------|
| `VITE_API_URL` | `https://conectaies-backend.onrender.com` |
| `VITE_WS_URL` | `wss://conectaies-backend.onrender.com` |

4. Clique em **Save**

### 7.2 Atualizar Código do Frontend (se necessário)

**Arquivo:** `src/app/core/services/api.service.ts` (ou similar)

```typescript
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class ApiService {
  private apiUrl = 'https://conectaies-backend.onrender.com'; // URL do Render

  constructor(private http: HttpClient) {}

  // Seus métodos aqui
}
```

### 7.3 Refazer Deploy do Frontend

```bash
cd ConectaIES-Front/conecta-ies-front
git add .
git commit -m "feat: conectar com backend no Render"
git push
```

Deploy automático no Vercel será disparado.

---

## 🧪 ETAPA 8: Testar Integração Completa

### Checklist de Testes:

- [ ] Frontend carrega (Vercel)
- [ ] Backend responde (Render)
- [ ] Login funciona
- [ ] Criar solicitação funciona
- [ ] Upload de anexos funciona
- [ ] WebSocket conecta
- [ ] Notificações em tempo real funcionam

---

## 🐛 Troubleshooting

### Erro: "Connection refused" no PostgreSQL

**Solução:**
- Verifique se o `DATABASE_URL` está correto
- Use a **Internal Database URL**, não a External
- Certifique-se que o Web Service está na mesma região do banco

### Erro: "synchronize" não criou as tabelas

**Solução:**
1. Verifique logs do Render
2. Acesse o banco via Render Dashboard → **Shell**
3. Execute:
   ```sql
   \dt -- Listar tabelas
   ```
4. Se vazio, verifique se `synchronize: true` está no código

### Erro: CORS bloqueando requests

**Solução:**
- Verifique se `FRONTEND_URL` está correto nas env vars
- Adicione a URL do Vercel no `main.ts` → `enableCors()`

### Admin não foi criado

**Solução:**
1. Verifique logs: `✅ Usuário admin criado`
2. Conecte ao banco e execute:
   ```sql
   SELECT * FROM users WHERE email = 'admin@conectaies.com';
   ```
3. Se não existir, execute manualmente no Shell do Render

---

## 📊 Monitoramento

### Render Dashboard

- **Logs**: Real-time logs da aplicação
- **Metrics**: CPU, Memory, Bandwidth
- **Events**: Deploy history

### PostgreSQL

- **Info**: Conexões ativas, tamanho do banco
- **Shell**: Acesso SQL direto
- **Backups**: Configurar backups automáticos

---

## 💰 Custos

### Plano Free (Render):

- **Web Service**: Grátis (750 horas/mês, dorme após 15min inativo)
- **PostgreSQL**: 90 dias grátis, depois $7/mês

### Upgrade Recomendado (após testes):

- **Starter Plan**: $7/mês (sem hibernação)
- **PostgreSQL**: $7/mês (sempre)

**Total:** ~$14/mês

---

## 🎉 Conclusão

Após seguir este guia:

✅ Backend NestJS rodando no Render
✅ PostgreSQL configurado e populado
✅ Usuário admin criado automaticamente
✅ Frontend no Vercel conectado ao backend
✅ CORS configurado
✅ SSL/HTTPS ativo (Render fornece automaticamente)

**Credenciais Admin:**
- 📧 Email: `admin@conectaies.com`
- 🔑 Senha: `Admin@123`

---

## 📚 Recursos Úteis

- **Render Docs**: https://render.com/docs
- **PostgreSQL no Render**: https://render.com/docs/databases
- **TypeORM PostgreSQL**: https://typeorm.io/connection-options#postgres--cockroachdb-connection-options
- **NestJS Deploy**: https://docs.nestjs.com/faq/serverless

---

**🎊 Parabéns! Sua aplicação está 100% no ar!**
