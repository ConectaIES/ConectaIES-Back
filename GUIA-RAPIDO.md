# ⚡ Guia Rápido - ConectaIES

Para setup completo e detalhado, veja: **[SETUP-COMPLETO.md](./SETUP-COMPLETO.md)**

---

## 🚀 Start em 5 Minutos

### 1. MySQL

```sql
-- Conectar ao MySQL
mysql -u root -p

-- Criar banco
CREATE DATABASE conecta_ies;
EXIT;
```

### 2. Configurar .env

```env
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=SUA_SENHA_AQUI
DB_NAME=conecta_ies
JWT_SECRET=conecta-ies-super-secret-key-2025
```

### 3. Rodar Back-end

```bash
npm install
npm run start:dev
```

✅ Servidor em: **http://localhost:3000**

### 4. Registrar Primeiro Usuário

```powershell
Invoke-RestMethod -Uri "http://localhost:3000/api/auth/register" `
  -Method POST `
  -ContentType "application/json" `
  -Body '{"nome":"Admin","email":"admin@test.com","senha":"senha123","tipoPerfil":"ADMIN"}'
```

Copie o `access_token` retornado!

### 5. Configurar Front-end

No Angular, configure:

```typescript
// environment.ts
export const environment = {
  apiUrl: 'http://localhost:3000/api',
  wsUrl: 'ws://localhost:3000'
};
```

### 6. Rodar Front-end

```bash
ng serve
```

✅ Front-end em: **http://localhost:4200**

---

## 📡 Endpoints Principais

| Método | Endpoint | Descrição |
|--------|----------|-----------|
| POST | `/api/auth/register` | Registrar usuário |
| POST | `/api/auth/login` | Login |
| POST | `/api/solicitacoes` | Criar solicitação |
| GET | `/api/solicitacoes/minhas` | Listar minhas |
| GET | `/api/solicitacoes/admin/novas` | Novas (ADMIN) |
| POST | `/api/solicitacoes/:id/primeira-resposta` | Primeira resposta (ADMIN) |

**Autenticação:** Adicione header `Authorization: Bearer TOKEN`

---

## 🔌 WebSocket

**Conectar:**
```typescript
const socket = io('http://localhost:3000');
```

**Eventos:**
- `nova-solicitacao` - Nova solicitação criada
- `atualizacao-status` - Status alterado

---

## 🐛 Troubleshooting Rápido

| Problema | Solução |
|----------|---------|
| "Unable to connect database" | Verificar se MySQL está rodando: `net start MySQL80` |
| "CORS error" | Verificar `origin` em `src/main.ts` |
| "Unauthorized 401" | Fazer login novamente para obter novo token |
| "Table doesn't exist" | Reiniciar servidor - TypeORM criará tabelas |

---

## 📋 Verificação Rápida

```bash
# Back-end rodando?
curl http://localhost:3000

# MySQL conectado?
mysql -u root -p -e "SHOW DATABASES;"

# Front-end rodando?
curl http://localhost:4200
```

---

## 🎯 Estrutura de Dados

**Registrar:**
```json
{
  "nome": "string",
  "email": "string",
  "senha": "string",
  "tipoPerfil": "ALUNO|PROFESSOR|ADMIN"
}
```

**Login:**
```json
{
  "email": "string",
  "senha": "string"
}
```

**Criar Solicitação:**
```json
{
  "titulo": "string",
  "descricao": "string",
  "tipo": "APOIO_LOCOMOCAO|INTERPRETACAO_LIBRAS|OUTROS"
}
```

---

## 🔑 Credenciais Padrão de Teste

- **Email:** admin@test.com
- **Senha:** senha123
- **Tipo:** ADMIN

---

## 📊 Verificar Dados no MySQL

```sql
USE conecta_ies;

-- Ver usuários
SELECT * FROM users;

-- Ver solicitações
SELECT * FROM solicitations;

-- Ver eventos
SELECT * FROM event_history;
```

---

## ⚙️ Comandos Úteis

```bash
# Formatar código
npm run format

# Build para produção
npm run build

# Rodar testes
npm test

# Ver logs do MySQL (Windows)
Get-EventLog -LogName Application -Source MySQL

# Parar MySQL (Windows)
net stop MySQL80
```

---

## 🌐 URLs de Desenvolvimento

| Serviço | URL |
|---------|-----|
| Back-end API | http://localhost:3000/api |
| WebSocket | ws://localhost:3000 |
| Front-end | http://localhost:4200 |
| MySQL | localhost:3306 |

---

Documentação completa: **[SETUP-COMPLETO.md](./SETUP-COMPLETO.md)**
