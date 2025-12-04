# 🔧 Configuração SQL Server - ConectaIES

## ✅ Backend Configurado para SQL Server

O backend já está configurado para conectar ao SQL Server existente.

---

## 📋 Configurações Atuais

**Arquivo `.env`:**
```env
DB_HOST=localhost
DB_PORT=1433
DB_USER=sa
DB_PASSWORD=Arthur!1406
DB_NAME=conecta_ies
```

**TypeORM:**
- ✅ Tipo: SQL Server (mssql)
- ✅ Synchronize: **false** (não cria tabelas automaticamente)
- ✅ Logging: **true** (mostra queries no console)
- ✅ Driver: `mssql` (já instalado no package.json)

---

## 🔍 Verificar Estrutura do Banco

Execute este script no SQL Server para verificar se as tabelas necessárias existem:

```sql
USE conecta_ies;
GO

-- Verificar tabelas existentes
SELECT 
    TABLE_NAME,
    TABLE_TYPE
FROM 
    INFORMATION_SCHEMA.TABLES
WHERE 
    TABLE_TYPE = 'BASE TABLE'
ORDER BY 
    TABLE_NAME;
GO

-- Verificar estrutura da tabela users
SELECT 
    COLUMN_NAME,
    DATA_TYPE,
    CHARACTER_MAXIMUM_LENGTH,
    IS_NULLABLE,
    COLUMN_DEFAULT
FROM 
    INFORMATION_SCHEMA.COLUMNS
WHERE 
    TABLE_NAME = 'users'
ORDER BY 
    ORDINAL_POSITION;
GO

-- Verificar estrutura da tabela solicitations
SELECT 
    COLUMN_NAME,
    DATA_TYPE,
    CHARACTER_MAXIMUM_LENGTH,
    IS_NULLABLE
FROM 
    INFORMATION_SCHEMA.COLUMNS
WHERE 
    TABLE_NAME = 'solicitations'
ORDER BY 
    ORDINAL_POSITION;
GO

-- Verificar estrutura da tabela attachments
SELECT 
    COLUMN_NAME,
    DATA_TYPE,
    CHARACTER_MAXIMUM_LENGTH,
    IS_NULLABLE
FROM 
    INFORMATION_SCHEMA.COLUMNS
WHERE 
    TABLE_NAME = 'attachments'
ORDER BY 
    ORDINAL_POSITION;
GO

-- Verificar estrutura da tabela event_history
SELECT 
    COLUMN_NAME,
    DATA_TYPE,
    CHARACTER_MAXIMUM_LENGTH,
    IS_NULLABLE
FROM 
    INFORMATION_SCHEMA.COLUMNS
WHERE 
    TABLE_NAME = 'event_history'
ORDER BY 
    ORDINAL_POSITION;
GO
```

---

## 📊 Estrutura Esperada das Tabelas

### Tabela: `users`
```sql
CREATE TABLE users (
    id INT IDENTITY(1,1) PRIMARY KEY,
    nome NVARCHAR(200) NOT NULL,
    email NVARCHAR(200) NOT NULL UNIQUE,
    senha_hash NVARCHAR(255) NOT NULL,
    tipo_perfil NVARCHAR(20) NOT NULL CHECK (tipo_perfil IN ('ALUNO', 'PROFESSOR', 'ADMIN')),
    matricula NVARCHAR(50) NULL,
    created_at DATETIME2 DEFAULT GETDATE(),
    updated_at DATETIME2 DEFAULT GETDATE()
);
```

### Tabela: `solicitations`
```sql
CREATE TABLE solicitations (
    id INT IDENTITY(1,1) PRIMARY KEY,
    protocolo NVARCHAR(50) NOT NULL UNIQUE,
    titulo NVARCHAR(200) NOT NULL,
    descricao NVARCHAR(MAX) NOT NULL,
    tipo NVARCHAR(50) NOT NULL CHECK (tipo IN ('APOIO_LOCOMOCAO', 'INTERPRETACAO_LIBRAS', 'OUTROS')),
    status NVARCHAR(50) DEFAULT 'ABERTO' CHECK (status IN ('ABERTO', 'NAO_VISTO', 'EM_ANALISE', 'EM_EXECUCAO', 'RESOLVIDO')),
    usuario_id INT NOT NULL,
    created_at DATETIME2 DEFAULT GETDATE(),
    updated_at DATETIME2 DEFAULT GETDATE(),
    first_response_at DATETIME2 NULL,
    FOREIGN KEY (usuario_id) REFERENCES users(id)
);
```

### Tabela: `attachments`
```sql
CREATE TABLE attachments (
    id INT IDENTITY(1,1) PRIMARY KEY,
    solicitacao_id INT NOT NULL,
    nome NVARCHAR(255) NOT NULL,
    url NVARCHAR(500) NOT NULL,
    tipo NVARCHAR(100) NOT NULL,
    created_at DATETIME2 DEFAULT GETDATE(),
    FOREIGN KEY (solicitacao_id) REFERENCES solicitations(id) ON DELETE CASCADE
);
```

### Tabela: `event_history`
```sql
CREATE TABLE event_history (
    id INT IDENTITY(1,1) PRIMARY KEY,
    solicitacao_id INT NOT NULL,
    evento_tipo NVARCHAR(50) NOT NULL CHECK (evento_tipo IN ('STATUS_CHANGE', 'COMMENT', 'ATTACHMENT')),
    descricao NVARCHAR(MAX) NOT NULL,
    usuario_id INT NULL,
    timestamp DATETIME2 DEFAULT GETDATE(),
    FOREIGN KEY (solicitacao_id) REFERENCES solicitations(id) ON DELETE CASCADE,
    FOREIGN KEY (usuario_id) REFERENCES users(id) ON DELETE SET NULL
);
```

---

## 🚀 Iniciar o Servidor

1. **Verificar se o SQL Server está rodando:**
   ```powershell
   # PowerShell
   Get-Service -Name "MSSQL*" | Select-Object Name, Status, StartType
   ```

2. **Verificar conectividade:**
   ```powershell
   # PowerShell - testar conexão
   sqlcmd -S localhost -U sa -P "Arthur!1406" -Q "SELECT @@VERSION"
   ```

3. **Iniciar o backend:**
   ```bash
   npm run start:dev
   ```

4. **Verificar logs de conexão:**
   Você deve ver no console:
   ```
   🔧 TypeORM Config: {
     type: 'mssql',
     host: 'localhost',
     port: 1433,
     database: 'conecta_ies',
     username: 'sa',
     hasPassword: true
   }
   ```

---

## ✅ Teste de Conexão

Após iniciar o servidor, teste se está conectado:

```powershell
# PowerShell - Registrar usuário
$body = @{
    nome = "Admin Teste"
    email = "admin@sqlserver.com"
    senha = "senha123"
    tipoPerfil = "ADMIN"
} | ConvertTo-Json

Invoke-RestMethod -Uri "http://localhost:3000/api/auth/register" `
    -Method POST `
    -ContentType "application/json" `
    -Body $body
```

Se retornar um objeto com `token` e `usuario`, a conexão está funcionando! ✅

---

## 🐛 Troubleshooting

### Erro: "Cannot connect to SQL Server"
- Verificar se SQL Server está rodando
- Verificar credenciais no `.env`
- Verificar firewall (porta 1433)

### Erro: "Login failed for user 'sa'"
- Verificar senha no `.env`
- Verificar se autenticação SQL está habilitada

### Erro: "Invalid object name 'users'"
- As tabelas não existem no banco
- Criar tabelas manualmente usando scripts acima

### Erro: "Column 'matricula' does not exist"
- Executar:
  ```sql
  ALTER TABLE users ADD matricula NVARCHAR(50) NULL;
  ```

---

## 📝 Notas Importantes

1. **Synchronize = false:** O TypeORM **NÃO** criará ou modificará tabelas automaticamente
2. **Banco existente:** O backend usará as tabelas que já existem no SQL Server
3. **Migrações:** Se precisar alterar estrutura, faça manualmente via SQL
4. **Backup:** Sempre faça backup antes de alterações no banco

---

## 🔄 Diferenças MySQL vs SQL Server

| Aspecto | MySQL | SQL Server |
|---------|-------|------------|
| **Porta** | 3306 | 1433 |
| **Auto-increment** | AUTO_INCREMENT | IDENTITY(1,1) |
| **Texto longo** | TEXT | NVARCHAR(MAX) |
| **Data/hora** | TIMESTAMP | DATETIME2 |
| **Case sensitivity** | Depende config | Depende collation |
| **Enum** | ENUM('val1','val2') | CHECK (col IN ('val1','val2')) |

As entidades TypeORM já estão preparadas para ambos os bancos! ✅
