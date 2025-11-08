# 🚀 Guia Completo de Setup - ConectaIES Backend + Frontend

Este guia detalha **PASSO A PASSO** como configurar o MySQL, conectar o back-end e integrar com o front-end Angular.

---

## 📑 Índice

1. [Instalação do MySQL](#1-instalação-do-mysql)
2. [Configuração do Banco de Dados](#2-configuração-do-banco-de-dados)
3. [Configuração do Back-end](#3-configuração-do-back-end)
4. [Testando o Back-end](#4-testando-o-back-end)
5. [Conectando Front-end com Back-end](#5-conectando-front-end-com-back-end)
6. [Testando a Integração Completa](#6-testando-a-integração-completa)
7. [Troubleshooting](#7-troubleshooting)

---

## 1. Instalação do MySQL

### Windows

**Opção A: MySQL Installer (Recomendado)**

1. **Baixar MySQL Installer:**
   - Acesse: https://dev.mysql.com/downloads/installer/
   - Baixe: `mysql-installer-community-8.x.x.msi`

2. **Executar o Installer:**
   - Clique duas vezes no arquivo baixado
   - Escolha: **"Developer Default"** ou **"Server only"**
   - Clique em **"Execute"** para instalar

3. **Configuração durante instalação:**
   - **Type and Networking:**
     - Config Type: `Development Computer`
     - Port: `3306` (padrão)
     - ✅ Marque "Open Windows Firewall port"
   
   - **Authentication Method:**
     - Escolha: `Use Strong Password Encryption`
   
   - **Accounts and Roles:**
     - **Root Password:** Digite uma senha (exemplo: `root123`)
     - ⚠️ **IMPORTANTE:** Anote esta senha! Você usará no `.env`
   
   - **Windows Service:**
     - Service Name: `MySQL80`
     - ✅ Marque "Start the MySQL Server at System Startup"

4. **Verificar instalação:**
```bash
# Abra o CMD ou PowerShell
mysql --version
```

Deve mostrar: `mysql  Ver 8.x.x`

**Opção B: XAMPP (Alternativa mais fácil)**

1. Baixe XAMPP: https://www.apachefriends.org/
2. Instale e abra o XAMPP Control Panel
3. Clique em **"Start"** ao lado de **MySQL**
4. Senha padrão do root no XAMPP é **vazia** (sem senha)

---

### macOS

```bash
# Usando Homebrew
brew install mysql

# Iniciar MySQL
brew services start mysql

# Configurar senha root
mysql_secure_installation
```

---

### Linux (Ubuntu/Debian)

```bash
# Atualizar repositórios
sudo apt update

# Instalar MySQL
sudo apt install mysql-server

# Verificar se está rodando
sudo systemctl status mysql

# Configurar senha root
sudo mysql_secure_installation
```

---

## 2. Configuração do Banco de Dados

### Passo 1: Conectar ao MySQL

**Windows (MySQL Installer):**
```bash
# Abra o CMD ou PowerShell
mysql -u root -p
```
Digite a senha que você criou durante a instalação.

**Windows (XAMPP):**
```bash
# Navegue até a pasta do XAMPP
cd C:\xampp\mysql\bin
mysql -u root
```
(Sem senha, apenas pressione Enter)

---

### Passo 2: Criar o Banco de Dados

Depois de conectar ao MySQL, execute:

```sql
-- Criar banco de dados
CREATE DATABASE conecta_ies CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- Verificar se foi criado
SHOW DATABASES;

-- Selecionar o banco
USE conecta_ies;
```

Você deve ver `conecta_ies` na lista de bancos.

---

### Passo 3: Criar Usuário (Opcional, mas recomendado)

Em vez de usar `root`, é melhor criar um usuário específico:

```sql
-- Criar usuário
CREATE USER 'conecta_user'@'localhost' IDENTIFIED BY 'conecta_senha123';

-- Dar permissões
GRANT ALL PRIVILEGES ON conecta_ies.* TO 'conecta_user'@'localhost';

-- Aplicar mudanças
FLUSH PRIVILEGES;

-- Sair
EXIT;
```

Agora você pode usar:
- **Usuário:** `conecta_user`
- **Senha:** `conecta_senha123`

---

## 3. Configuração do Back-end

### Passo 1: Configurar Variáveis de Ambiente

Edite o arquivo `.env` na raiz do projeto back-end:

**Se estiver usando MySQL Installer:**
```env
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=SUA_SENHA_AQUI
DB_NAME=conecta_ies
JWT_SECRET=conecta-ies-super-secret-key-2025
```

**Se estiver usando XAMPP:**
```env
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=
DB_NAME=conecta_ies
JWT_SECRET=conecta-ies-super-secret-key-2025
```

**Se criou usuário específico:**
```env
DB_HOST=localhost
DB_PORT=3306
DB_USER=conecta_user
DB_PASSWORD=conecta_senha123
DB_NAME=conecta_ies
JWT_SECRET=conecta-ies-super-secret-key-2025
```

⚠️ **IMPORTANTE:** Substitua os valores conforme SUA configuração!

---

### Passo 2: Instalar Dependências (se ainda não fez)

```bash
npm install
```

---

### Passo 3: Iniciar o Servidor

```bash
npm run start:dev
```

**O que deve acontecer:**

```
[Nest] Starting Nest application...
[Nest] DatabaseModule dependencies initialized
[Nest] TypeOrmModule dependencies initialized
...
query: SELECT VERSION() AS `version`
query: CREATE TABLE `users` (...)
query: CREATE TABLE `solicitations` (...)
query: CREATE TABLE `attachments` (...)
query: CREATE TABLE `event_history` (...)
[Nest] Nest application successfully started
🚀 Servidor rodando em http://localhost:3000
🔌 WebSocket disponível em ws://localhost:3000
```

✅ **Se você viu essas mensagens, o back-end está conectado ao MySQL!**

As tabelas foram criadas automaticamente pelo TypeORM.

---

### Passo 4: Verificar Tabelas Criadas

Volte ao MySQL:

```bash
mysql -u root -p
```

Execute:

```sql
USE conecta_ies;

SHOW TABLES;
```

Você deve ver:
```
+-------------------------+
| Tables_in_conecta_ies   |
+-------------------------+
| attachments             |
| event_history           |
| solicitations           |
| users                   |
+-------------------------+
```

---

## 4. Testando o Back-end

### Teste 1: Registrar Usuário

**Usando PowerShell/CMD:**

```powershell
# Registrar usuário ADMIN
Invoke-RestMethod -Uri "http://localhost:3000/api/auth/register" `
  -Method POST `
  -ContentType "application/json" `
  -Body '{"nome":"Admin Teste","email":"admin@test.com","senha":"senha123","tipoPerfil":"ADMIN"}'
```

**Usando cURL (Git Bash):**

```bash
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"nome":"Admin Teste","email":"admin@test.com","senha":"senha123","tipoPerfil":"ADMIN"}'
```

**Resposta esperada:**
```json
{
  "user": {
    "id": 1,
    "nome": "Admin Teste",
    "email": "admin@test.com",
    "tipoPerfil": "ADMIN"
  },
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

⚠️ **Copie o `access_token`!** Você usará nos próximos testes.

---

### Teste 2: Fazer Login

```powershell
Invoke-RestMethod -Uri "http://localhost:3000/api/auth/login" `
  -Method POST `
  -ContentType "application/json" `
  -Body '{"email":"admin@test.com","senha":"senha123"}'
```

---

### Teste 3: Criar Solicitação

**IMPORTANTE:** Substitua `SEU_TOKEN_AQUI` pelo token que você copiou!

```powershell
# Criar solicitação sem anexos
$headers = @{
    "Authorization" = "Bearer SEU_TOKEN_AQUI"
    "Content-Type" = "application/json"
}

Invoke-RestMethod -Uri "http://localhost:3000/api/solicitacoes" `
  -Method POST `
  -Headers $headers `
  -Body '{"titulo":"Necessito apoio","descricao":"Preciso de ajuda para locomoção","tipo":"APOIO_LOCOMOCAO"}'
```

**Resposta esperada:**
```json
{
  "id": 1,
  "protocolo": "SOL-2025-0001",
  "titulo": "Necessito apoio",
  "descricao": "Preciso de ajuda para locomoção",
  "tipo": "APOIO_LOCOMOCAO",
  "status": "ABERTO",
  "usuarioId": 1,
  "usuarioNome": "Admin Teste",
  "timeToTmrBreach": 14400,
  ...
}
```

---

### Teste 4: Listar Solicitações

```powershell
$headers = @{
    "Authorization" = "Bearer SEU_TOKEN_AQUI"
}

Invoke-RestMethod -Uri "http://localhost:3000/api/solicitacoes/minhas" `
  -Method GET `
  -Headers $headers
```

---

### Teste 5: Verificar WebSocket

Abra o navegador e vá para: **http://localhost:3000**

Se der erro 404, está OK! O servidor está rodando. O WebSocket está na porta 3000 também.

---

## 5. Conectando Front-end com Back-end

### Passo 1: Localizar Configuração do Front-end

No projeto **Angular** (front-end), encontre o arquivo de configuração da API. Geralmente está em:

```
src/environments/environment.ts
```

ou

```
src/app/config/api.config.ts
```

ou onde estiver a configuração de URL da API.

---

### Passo 2: Configurar URL da API

**Exemplo de configuração:**

```typescript
// environment.ts
export const environment = {
  production: false,
  apiUrl: 'http://localhost:3000/api',
  wsUrl: 'ws://localhost:3000'
};
```

ou se tiver um arquivo de configuração separado:

```typescript
// api.config.ts
export const API_CONFIG = {
  baseUrl: 'http://localhost:3000/api',
  wsUrl: 'ws://localhost:3000'
};
```

⚠️ **IMPORTANTE:** A URL deve ser **exatamente** `http://localhost:3000/api`

---

### Passo 3: Verificar Serviço HTTP

Encontre o serviço que faz as requisições HTTP (geralmente `api.service.ts` ou `http.service.ts`):

```typescript
import { HttpClient } from '@angular/common/http';
import { environment } from '../environments/environment';

@Injectable()
export class ApiService {
  private baseUrl = environment.apiUrl; // http://localhost:3000/api

  constructor(private http: HttpClient) {}

  // As requisições devem usar this.baseUrl
  getSolicitacoes() {
    return this.http.get(`${this.baseUrl}/solicitacoes/minhas`);
  }
}
```

---

### Passo 4: Configurar WebSocket (Socket.IO)

Se o front-end usa Socket.IO, a configuração deve ser:

```typescript
import { io } from 'socket.io-client';
import { environment } from '../environments/environment';

export class WebSocketService {
  private socket;

  connect() {
    this.socket = io(environment.wsUrl || 'http://localhost:3000', {
      transports: ['websocket', 'polling']
    });

    // Escutar eventos
    this.socket.on('nova-solicitacao', (data) => {
      console.log('Nova solicitação recebida:', data);
    });

    this.socket.on('atualizacao-status', (data) => {
      console.log('Status atualizado:', data);
    });
  }
}
```

---

### Passo 5: Iniciar Front-end

```bash
# No diretório do front-end Angular
ng serve
```

O front-end rodará em: **http://localhost:4200**

---

## 6. Testando a Integração Completa

### Teste 1: Login no Front-end

1. Abra: **http://localhost:4200**
2. Faça login com:
   - **Email:** `admin@test.com`
   - **Senha:** `senha123`

---

### Teste 2: Criar Solicitação

1. No front-end, vá para a tela de criar solicitação
2. Preencha os campos
3. Clique em enviar

**O que deve acontecer:**
- ✅ Requisição POST para `http://localhost:3000/api/solicitacoes`
- ✅ Solicitação criada no banco
- ✅ WebSocket emite evento `nova-solicitacao`
- ✅ Dashboard admin atualiza em tempo real

---

### Teste 3: Verificar no Console do Navegador

Abra o DevTools (F12) e vá para a aba **Network**:

- Você deve ver requisições para `localhost:3000/api/...`
- Status `200 OK` ou `201 Created`

Vá para a aba **Console**:
- Se o WebSocket conectou, você verá: `WebSocket connected` ou similar

---

### Teste 4: Verificar no Banco de Dados

```sql
USE conecta_ies;

-- Ver usuários
SELECT * FROM users;

-- Ver solicitações
SELECT * FROM solicitations;

-- Ver histórico
SELECT * FROM event_history;
```

---

## 7. Troubleshooting

### ❌ Erro: "Unable to connect to the database"

**Causa:** MySQL não está rodando ou credenciais erradas.

**Solução:**

1. Verificar se MySQL está rodando:
```bash
# Windows
net start MySQL80

# Linux/Mac
sudo systemctl status mysql
```

2. Testar conexão manual:
```bash
mysql -u root -p
```

3. Verificar arquivo `.env`:
```env
DB_USER=root
DB_PASSWORD=SUA_SENHA_CORRETA
DB_NAME=conecta_ies
```

---

### ❌ Erro: "CORS policy" no navegador

**Causa:** Front-end não está autorizado a acessar o back-end.

**Solução:**

Verifique em `src/main.ts`:

```typescript
app.enableCors({
  origin: 'http://localhost:4200', // URL do front-end
  credentials: true,
});
```

---

### ❌ Erro: "Cannot POST /api/auth/login"

**Causa:** Rota não encontrada ou servidor não está rodando.

**Solução:**

1. Verificar se servidor está rodando:
```bash
npm run start:dev
```

2. Testar a URL diretamente:
```
http://localhost:3000/api/auth/login
```

---

### ❌ Erro: "Unauthorized" (401)

**Causa:** Token JWT inválido ou expirado.

**Solução:**

1. Fazer login novamente para obter novo token
2. Verificar se o token está sendo enviado no header:
```typescript
headers: {
  'Authorization': `Bearer ${token}`
}
```

---

### ❌ WebSocket não conecta

**Causa:** Configuração incorreta do Socket.IO.

**Solução:**

Verificar configuração no front-end:
```typescript
io('http://localhost:3000', {
  transports: ['websocket', 'polling']
})
```

Verificar no back-end (`src/websocket/websocket.gateway.ts`):
```typescript
@WebSocketGateway({
  cors: {
    origin: 'http://localhost:4200',
    credentials: true,
  },
})
```

---

### ❌ Erro: "Table doesn't exist"

**Causa:** TypeORM não criou as tabelas.

**Solução:**

1. Verificar em `src/database/database.module.ts`:
```typescript
synchronize: true, // Deve estar true em desenvolvimento
```

2. Deletar banco e deixar TypeORM recriar:
```sql
DROP DATABASE conecta_ies;
CREATE DATABASE conecta_ies;
```

3. Reiniciar servidor:
```bash
npm run start:dev
```

---

## 🎯 Checklist Final

Antes de considerar tudo funcionando, verifique:

### Back-end:
- [ ] MySQL instalado e rodando
- [ ] Banco `conecta_ies` criado
- [ ] Arquivo `.env` configurado corretamente
- [ ] Servidor rodando sem erros (`npm run start:dev`)
- [ ] Tabelas criadas automaticamente (users, solicitations, etc.)
- [ ] Endpoint de login funcionando
- [ ] Endpoint de criar solicitação funcionando
- [ ] WebSocket conectando

### Front-end:
- [ ] URL da API configurada (`http://localhost:3000/api`)
- [ ] URL do WebSocket configurada (`ws://localhost:3000`)
- [ ] Servidor rodando (`ng serve`)
- [ ] Login funcionando
- [ ] Criar solicitação funcionando
- [ ] Atualização em tempo real funcionando

### Integração:
- [ ] Front-end consegue fazer login no back-end
- [ ] Front-end consegue criar solicitações
- [ ] Front-end recebe eventos WebSocket
- [ ] Dados aparecem no banco de dados MySQL
- [ ] Console do navegador sem erros de CORS

---

## 📞 Suporte Adicional

Se ainda tiver problemas:

1. **Verificar logs do back-end:** Olhe o terminal onde rodou `npm run start:dev`
2. **Verificar logs do front-end:** Olhe o console do navegador (F12)
3. **Verificar MySQL:** Execute `SHOW PROCESSLIST;` para ver conexões ativas

---

## 🚀 Pronto!

Se todos os itens do checklist estão marcados, sua aplicação está **100% funcional** e pronta para desenvolvimento!

**URLs Principais:**
- **Back-end API:** http://localhost:3000/api
- **WebSocket:** ws://localhost:3000
- **Front-end:** http://localhost:4200
- **MySQL:** localhost:3306

**Usuário de Teste:**
- **Email:** admin@test.com
- **Senha:** senha123
- **Tipo:** ADMIN
