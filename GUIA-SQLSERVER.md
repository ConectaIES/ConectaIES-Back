# ⚡ Guia Rápido - SQL Server Configurado

## ✅ O que foi feito:

1. ✅ Backend configurado para **SQL Server** (porta 1433)
2. ✅ **Synchronize = false** (não cria/altera tabelas automaticamente)
3. ✅ Conectará ao banco **existente**: `conecta_ies`
4. ✅ Driver `mssql` já instalado

---

## 🚀 Como Usar (3 passos):

### 1️⃣ Verificar Banco de Dados

Execute no SQL Server Management Studio (SSMS) ou Azure Data Studio:

```sql
-- Abrir o script
USE conecta_ies;
SELECT * FROM INFORMATION_SCHEMA.TABLES;
```

Ou execute o script completo:
```bash
sqlcmd -S localhost -U sa -P "Arthur!1406" -i verificar-banco-sqlserver.sql
```

### 2️⃣ Iniciar Backend

```bash
npm run start:dev
```

**Você verá no console:**
```
🔧 TypeORM Config: {
  type: 'mssql',
  host: 'localhost',
  port: 1433,
  database: 'conecta_ies',
  username: 'sa',
  hasPassword: true
}
[Nest] INFO [TypeOrmModule] Dependencies initialized
🚀 Servidor rodando em http://localhost:3000
```

### 3️⃣ Testar API

```powershell
# PowerShell - Registrar usuário
$body = @{
    nome = "Admin"
    email = "admin@test.com"
    senha = "senha123"
    tipoPerfil = "ADMIN"
} | ConvertTo-Json

Invoke-RestMethod -Uri "http://localhost:3000/api/auth/register" `
    -Method POST `
    -ContentType "application/json" `
    -Body $body
```

---

## 🔍 Verificações

### Verificar se SQL Server está rodando:
```powershell
Get-Service -Name "MSSQL*" | Select-Object Name, Status
```

### Testar conexão SQL Server:
```powershell
sqlcmd -S localhost -U sa -P "Arthur!1406" -Q "SELECT @@VERSION"
```

### Ver dados no banco:
```sql
USE conecta_ies;
SELECT * FROM users;
SELECT * FROM solicitations;
```

---

## ⚙️ Configuração Atual (`.env`)

```env
DB_HOST=localhost
DB_PORT=1433           # ← SQL Server
DB_USER=sa
DB_PASSWORD=Arthur!1406
DB_NAME=conecta_ies
JWT_SECRET=conecta-ies-super-secret-key-2025
```

---

## 📋 Tabelas Necessárias

O backend espera estas tabelas no banco `conecta_ies`:

1. ✅ `users` - Usuários do sistema
2. ✅ `solicitations` - Solicitações
3. ✅ `attachments` - Anexos
4. ✅ `event_history` - Histórico de eventos

**Se as tabelas não existirem, veja:** `SQLSERVER-VERIFICACAO.md`

---

## 🐛 Troubleshooting Rápido

| Erro | Solução |
|------|---------|
| "Cannot connect to SQL Server" | Verificar se serviço está rodando |
| "Login failed" | Verificar senha no `.env` |
| "Invalid object name 'users'" | Criar tabelas no banco |
| "Port 1433 is unavailable" | Verificar firewall/outro serviço usando porta |

---

## ✅ Checklist

- [ ] SQL Server rodando
- [ ] Banco `conecta_ies` existe
- [ ] Tabelas criadas (users, solicitations, etc)
- [ ] Credenciais corretas no `.env`
- [ ] `npm install` executado
- [ ] `npm run start:dev` funciona
- [ ] API responde em `http://localhost:3000`

---

**Pronto!** O backend está configurado para usar seu banco SQL Server existente. 🎉
