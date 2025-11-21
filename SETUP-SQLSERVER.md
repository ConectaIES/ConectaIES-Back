# 🗄️ Setup SQL Server - ConectaIES

**Data:** 21/11/2025  
**Objetivo:** Configurar backend NestJS com SQL Server

---

## 📋 Pré-requisitos

### Opção 1: SQL Server Express (Recomendado para desenvolvimento)

1. **Download SQL Server Express:**
   - Acesse: https://www.microsoft.com/sql-server/sql-server-downloads
   - Baixe **SQL Server 2022 Express**

2. **Instalar SQL Server:**
   - Execute o instalador
   - Escolha **"Basic"** installation
   - Aceite os termos e clique em **"Install"**
   - Anote a **connection string** exibida no final

3. **Instalar SQL Server Management Studio (SSMS) - Opcional mas recomendado:**
   - Download: https://aka.ms/ssmsfullsetup
   - Instale para gerenciar o banco visualmente

### Opção 2: Docker (Alternativa)

```powershell
docker run -e "ACCEPT_EULA=Y" -e "SA_PASSWORD=SuaSenhaForte123!" `
  -p 1433:1433 --name sqlserver `
  -d mcr.microsoft.com/mssql/server:2022-latest
```

---

## 🔧 Configuração do Backend

### 1. Instalar Dependência SQL Server

```bash
cd ConectaIES-Back
npm install mssql
```

### 2. Configurar Variáveis de Ambiente

Edite o arquivo `.env`:

```env
# SQL Server Configuration
DB_HOST=localhost
DB_PORT=1433
DB_USER=sa
DB_PASSWORD=SuaSenhaForteAqui123!
DB_NAME=conecta_ies

# JWT Configuration
JWT_SECRET=conecta-ies-super-secret-key-2025

# Server Configuration
PORT=3000
NODE_ENV=development
```

⚠️ **Importante:** 
- Substitua `SuaSenhaForteAqui123!` pela senha que você definiu durante a instalação
- Para SQL Server Express, o usuário padrão é `sa` (System Administrator)

---

## 🗃️ Criar Database

### Opção A: Via SSMS (SQL Server Management Studio)

1. Abra **SSMS**
2. Conecte com:
   - Server: `localhost` ou `localhost\SQLEXPRESS`
   - Authentication: `SQL Server Authentication`
   - Login: `sa`
   - Password: Sua senha

3. Execute o script:

```sql
CREATE DATABASE conecta_ies;
GO
```

### Opção B: Via PowerShell (sqlcmd)

```powershell
# Verificar se sqlcmd está disponível
sqlcmd -?

# Criar database
sqlcmd -S localhost -U sa -P "SuaSenhaForte123!" -Q "CREATE DATABASE conecta_ies"

# Executar script completo
sqlcmd -S localhost -U sa -P "SuaSenhaForte123!" -i database-init-sqlserver.sql
```

### Opção C: Automático (TypeORM)

O TypeORM criará automaticamente as tabelas quando você iniciar o servidor pela primeira vez com `synchronize: true`.

---

## 🚀 Iniciar Backend

```bash
npm run start:dev
```

**Saída esperada:**

```
[Nest] Starting Nest application...
[Nest] TypeOrmModule dependencies initialized
[Nest] Connecting to SQL Server...
[Nest] Database connected successfully
🚀 Servidor rodando em http://localhost:3000
🔌 WebSocket disponível em ws://localhost:3000
```

---

## ✅ Validar Conexão

### 1. Verificar Tabelas Criadas

**Via SSMS:**
```sql
USE conecta_ies;
GO

-- Listar tabelas
SELECT TABLE_NAME 
FROM INFORMATION_SCHEMA.TABLES 
WHERE TABLE_TYPE = 'BASE TABLE';
GO

-- Deve mostrar:
-- users
-- solicitations
-- attachments
-- event_history
```

**Via PowerShell:**
```powershell
sqlcmd -S localhost -U sa -P "SuaSenhaForte123!" -d conecta_ies -Q "SELECT name FROM sys.tables"
```

### 2. Testar API

```powershell
# Registrar usuário
$body = @{
    nome = "Admin Teste"
    email = "admin@test.com"
    senha = "senha123"
    tipoPerfil = "ADMIN"
    matricula = "ADM001"
} | ConvertTo-Json

Invoke-RestMethod -Uri "http://localhost:3000/api/auth/register" `
    -Method POST `
    -ContentType "application/json" `
    -Body $body
```

---

## 🔍 Diferenças MySQL → SQL Server

| Aspecto | MySQL | SQL Server |
|---------|-------|------------|
| **Driver** | `mysql2` | `mssql` |
| **Porta padrão** | 3306 | 1433 |
| **Auto-increment** | `AUTO_INCREMENT` | `IDENTITY(1,1)` |
| **Timestamp** | `TIMESTAMP` | `DATETIME2` |
| **Text** | `TEXT` | `NVARCHAR(MAX)` |
| **Enum** | `ENUM(...)` | `CHECK (column IN (...))` |
| **Comentários** | `--` ou `#` | `--` apenas |
| **Trigger update** | Automático | Manual (trigger criado) |

---

## 🐛 Troubleshooting

### Erro: "Login failed for user 'sa'"

**Solução:**
```sql
-- Habilitar autenticação SQL Server
-- No SSMS: Server Properties → Security → SQL Server and Windows Authentication mode
-- Ou execute:
USE master;
GO
ALTER LOGIN sa WITH PASSWORD = 'NovaSenhaForte123!';
ALTER LOGIN sa ENABLE;
GO
```

### Erro: "A connection was successfully established with the server, but then an error occurred"

**Solução:** Adicione no `.env`:
```env
DB_ENCRYPT=false
DB_TRUST_SERVER_CERTIFICATE=true
```

### Erro: "Cannot connect to localhost"

**Verificar se SQL Server está rodando:**
```powershell
# Verificar serviço
Get-Service | Where-Object {$_.DisplayName -like "*SQL Server*"}

# Iniciar serviço se necessário
Start-Service MSSQLSERVER
# ou para Express:
Start-Service MSSQL$SQLEXPRESS
```

### Porta 1433 bloqueada?

**Verificar Firewall:**
```powershell
# Abrir porta no firewall
New-NetFirewallRule -DisplayName "SQL Server" -Direction Inbound -Protocol TCP -LocalPort 1433 -Action Allow
```

---

## 📊 Comandos Úteis SQL Server

### Consultas Básicas

```sql
-- Ver databases
SELECT name FROM sys.databases;

-- Usar database
USE conecta_ies;

-- Ver tabelas
SELECT * FROM INFORMATION_SCHEMA.TABLES;

-- Ver estrutura de tabela
EXEC sp_help 'users';

-- Ver dados
SELECT * FROM users;

-- Limpar tabela
TRUNCATE TABLE users;

-- Deletar database
DROP DATABASE conecta_ies;
```

### Performance

```sql
-- Ver tamanho do database
EXEC sp_spaceused;

-- Índices de uma tabela
EXEC sp_helpindex 'users';

-- Estatísticas de queries
SELECT * FROM sys.dm_exec_query_stats;
```

---

## 🔄 Migração de Dados (MySQL → SQL Server)

Se você já tem dados no MySQL:

### 1. Exportar do MySQL

```bash
mysqldump -u root -p conecta_ies > backup.sql
```

### 2. Converter para SQL Server

Use ferramentas como:
- **SQL Server Migration Assistant (SSMA)** - https://www.microsoft.com/download/details.aspx?id=54258
- **Azure Data Studio** com extensão de migração

### 3. Importar para SQL Server

```powershell
sqlcmd -S localhost -U sa -P "senha" -d conecta_ies -i converted_backup.sql
```

---

## 📚 Arquivos Modificados

### Backend
- ✅ `package.json` - Removido `mysql2`, adicionado `mssql`
- ✅ `src/database/database.module.ts` - Tipo alterado para `mssql`
- ✅ `.env.example` - Configuração SQL Server
- ✅ `database-init-sqlserver.sql` - Script de inicialização

### Frontend
- ℹ️ Nenhuma alteração necessária (API permanece a mesma)

---

## 🎯 Próximos Passos

1. ✅ Instalar SQL Server Express
2. ✅ Instalar dependência `npm install mssql`
3. ✅ Configurar `.env` com credenciais
4. ✅ Criar database `conecta_ies`
5. ✅ Iniciar backend `npm run start:dev`
6. ✅ Validar conexão e tabelas
7. ✅ Testar endpoints de autenticação

---

**Status:** ✅ **Backend configurado para SQL Server!**  
**Compatibilidade:** Total com frontend Angular (sem alterações necessárias)
