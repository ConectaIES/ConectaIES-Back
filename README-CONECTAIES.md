# ConectaIES - Backend

Backend da plataforma ConectaIES desenvolvido com NestJS, TypeORM, MySQL e Socket.IO.

## 🚀 Setup Rápido

### 1. Instalar dependências
```bash
npm install
```

### 2. Configurar MySQL

Edite `.env` com suas credenciais:
```env
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=SUA_SENHA_AQUI
DB_NAME=conecta_ies
```

### 3. Criar banco de dados

No MySQL:
```sql
CREATE DATABASE conecta_ies;
```

O TypeORM criará as tabelas automaticamente!

### 4. Executar servidor

```bash
npm run start:dev
```

Servidor rodando em: **http://localhost:3000**

## 📡 Testar API

### Registrar usuário Admin:
```bash
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d "{\"nome\":\"Admin\",\"email\":\"admin@test.com\",\"senha\":\"senha123\",\"tipoPerfil\":\"ADMIN\"}"
```

**Resposta:**
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "usuario": {
    "id": 1,
    "nome": "Admin",
    "email": "admin@test.com",
    "tipoPerfil": "ADMIN"
  }
}
```

### Login:
```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d "{\"email\":\"admin@test.com\",\"senha\":\"senha123\"}"
```

Copie o `token` retornado!

### Criar solicitação:
```bash
curl -X POST http://localhost:3000/api/solicitacoes \
  -H "Authorization: Bearer SEU_TOKEN_AQUI" \
  -F "titulo=Teste" \
  -F "descricao=Descrição teste" \
  -F "tipo=APOIO_LOCOMOCAO"
```

## 🔌 WebSocket

Conectar em: `ws://localhost:3000`

Eventos emitidos:
- `nova-solicitacao` - Quando criar solicitação
- `atualizacao-status` - Quando status mudar

## 📚 Documentação Completa

Veja `/docs/backend-integration-guide.md` para todos os endpoints e detalhes.

## ✅ Status

- ✅ Autenticação JWT
- ✅ CRUD de solicitações
- ✅ Upload de arquivos (até 3, 5MB cada)
- ✅ WebSocket em tempo real
- ✅ Cálculo automático de TMR (4 horas)
- ✅ Histórico de eventos
- ✅ Integração completa com front-end Angular

## 🎯 Próximos Passos

1. Configurar MySQL
2. Executar `npm run start:dev`
3. Registrar usuário admin
4. Conectar front-end Angular em `http://localhost:4200`
5. Testar criação de solicitações

Tudo pronto para integração com o front-end! 🚀
