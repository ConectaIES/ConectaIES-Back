# 📚 ConectaIES - Documentação Completa

Bem-vindo ao backend do **ConectaIES**! Este projeto está 100% implementado e pronto para uso.

---

## 🚀 Começar Agora

### Para desenvolvedores iniciantes ou com pressa:
👉 **[GUIA-RAPIDO.md](./GUIA-RAPIDO.md)** - Start em 5 minutos

### Para setup detalhado passo a passo:
👉 **[SETUP-COMPLETO.md](./SETUP-COMPLETO.md)** - Guia completo com explicações

---

## 📖 Documentação Disponível

### 1. 📘 Guias de Setup

| Documento | Descrição | Para quem? |
|-----------|-----------|------------|
| **[GUIA-RAPIDO.md](./GUIA-RAPIDO.md)** | Start rápido em 5 minutos | Desenvolvedores experientes |
| **[SETUP-COMPLETO.md](./SETUP-COMPLETO.md)** | Setup detalhado + Troubleshooting | Iniciantes ou primeira vez |
| **[CHECKLIST-VALIDACAO.md](./CHECKLIST-VALIDACAO.md)** | Validar se tudo funciona | Todos (após setup) |

### 2. 📗 Referência Técnica

| Documento | Descrição | Quando usar |
|-----------|-----------|-------------|
| **[exemplos-requisicoes.md](./exemplos-requisicoes.md)** | Exemplos de API (PowerShell/cURL/JS) | Testar endpoints |
| **[comandos-mysql.sql](./comandos-mysql.sql)** | Comandos SQL úteis | Consultar/gerenciar banco |
| **[docs/backend-integration-guide.md](./docs/backend-integration-guide.md)** | Especificação completa da API | Integração front-end |
| **[docs/backend-code-examples.md](./docs/backend-code-examples.md)** | Exemplos de código backend | Entender implementação |

---

## ⚡ Quick Start (3 Passos)

```bash
# 1. MySQL: Criar banco
mysql -u root -p
CREATE DATABASE conecta_ies;
EXIT;

# 2. Configurar .env
# Edite o arquivo .env com suas credenciais MySQL

# 3. Rodar servidor
npm install
npm run start:dev
```

✅ Pronto! Servidor em **http://localhost:3000**

---

## 🎯 O que Este Projeto Faz?

Sistema de gerenciamento de solicitações de acessibilidade para instituições de ensino, com:

- ✅ **Autenticação JWT** (Login/Register)
- ✅ **CRUD de Solicitações** (Criar, Listar, Editar)
- ✅ **Upload de Arquivos** (até 3 arquivos, 5MB cada)
- ✅ **WebSocket em Tempo Real** (Notificações instantâneas)
- ✅ **Dashboard Admin** (Gerenciar solicitações)
- ✅ **KPI TMR** (Tempo Médio de Resposta < 4 horas)
- ✅ **Histórico Completo** (Rastreamento de eventos)

---

## 🛠️ Stack Tecnológica

- **Framework:** NestJS (Node.js)
- **Banco de Dados:** MySQL 8+
- **ORM:** TypeORM
- **WebSocket:** Socket.IO
- **Autenticação:** JWT (Passport)
- **Upload:** Multer
- **Linguagem:** TypeScript

---

## 📡 Endpoints Principais

| Método | Endpoint | Descrição |
|--------|----------|-----------|
| POST | `/api/auth/register` | Registrar usuário |
| POST | `/api/auth/login` | Login |
| POST | `/api/solicitacoes` | Criar solicitação |
| GET | `/api/solicitacoes/minhas` | Minhas solicitações |
| GET | `/api/solicitacoes/admin/novas` | Dashboard admin |
| POST | `/api/solicitacoes/:id/primeira-resposta` | Primeira resposta (TMR) |

**Documentação completa:** [exemplos-requisicoes.md](./exemplos-requisicoes.md)

---

## 🔌 WebSocket

**Conectar:** `ws://localhost:3000`

**Eventos:**
- `nova-solicitacao` - Nova solicitação criada
- `atualizacao-status` - Status alterado

**Exemplo:**
```javascript
const socket = io('http://localhost:3000');
socket.on('nova-solicitacao', (data) => console.log(data));
```

---

## 🗂️ Estrutura do Projeto

```
src/
├── auth/               # Autenticação JWT
├── database/           # Entidades TypeORM
│   └── entities/       # User, Solicitacao, Anexo, EventoHistorico
├── solicitacoes/       # Módulo de solicitações
│   ├── dto/            # Data Transfer Objects
│   ├── solicitacoes.controller.ts
│   ├── solicitacoes.service.ts
│   └── solicitacoes.module.ts
├── websocket/          # Gateway WebSocket
└── main.ts             # Entry point
```

---

## 🎓 Para Integrar com Front-end Angular

1. **Configure a URL da API** no front-end:
   ```typescript
   // environment.ts
   export const environment = {
     apiUrl: 'http://localhost:3000/api',
     wsUrl: 'ws://localhost:3000'
   };
   ```

2. **Veja o guia de integração completo:**
   - [SETUP-COMPLETO.md - Seção 5](./SETUP-COMPLETO.md#5-conectando-front-end-com-back-end)
   - [docs/backend-integration-guide.md](./docs/backend-integration-guide.md)

---

## 🐛 Problemas Comuns

| Problema | Solução Rápida |
|----------|----------------|
| "Unable to connect database" | Verificar se MySQL está rodando: `net start MySQL80` |
| "CORS error" | Verificar origem em `src/main.ts` |
| "Unauthorized 401" | Fazer login novamente |
| "Table doesn't exist" | Reiniciar servidor (TypeORM cria tabelas) |

**Troubleshooting completo:** [SETUP-COMPLETO.md - Seção 7](./SETUP-COMPLETO.md#7-troubleshooting)

---

## ✅ Validar Instalação

Após configurar, execute este teste rápido:

```powershell
# 1. Registrar usuário
Invoke-RestMethod -Uri "http://localhost:3000/api/auth/register" `
  -Method POST `
  -ContentType "application/json" `
  -Body '{"nome":"Admin","email":"admin@test.com","senha":"senha123","tipoPerfil":"ADMIN"}'

# Se retornar um objeto com 'access_token', está funcionando! ✅
```

**Checklist completo:** [CHECKLIST-VALIDACAO.md](./CHECKLIST-VALIDACAO.md)

---

## 📞 Suporte e Recursos

- **Documentação técnica:** `/docs` (backend-integration-guide.md, api-contract.md)
- **Exemplos de código:** [docs/backend-code-examples.md](./docs/backend-code-examples.md)
- **Comandos SQL:** [comandos-mysql.sql](./comandos-mysql.sql)
- **Exemplos de API:** [exemplos-requisicoes.md](./exemplos-requisicoes.md)

---

## 🎯 Próximos Passos

1. ✅ **Configurar MySQL** → [SETUP-COMPLETO.md - Seção 2](./SETUP-COMPLETO.md#2-configuração-do-banco-de-dados)
2. ✅ **Configurar .env** → [SETUP-COMPLETO.md - Seção 3](./SETUP-COMPLETO.md#3-configuração-do-back-end)
3. ✅ **Rodar servidor** → `npm run start:dev`
4. ✅ **Testar API** → [exemplos-requisicoes.md](./exemplos-requisicoes.md)
5. ✅ **Integrar front-end** → [SETUP-COMPLETO.md - Seção 5](./SETUP-COMPLETO.md#5-conectando-front-end-com-back-end)
6. ✅ **Validar tudo** → [CHECKLIST-VALIDACAO.md](./CHECKLIST-VALIDACAO.md)

---

## 📊 Status do Projeto

- ✅ **Backend:** 100% implementado
- ✅ **Banco de Dados:** Estrutura completa
- ✅ **Autenticação:** JWT funcionando
- ✅ **WebSocket:** Tempo real implementado
- ✅ **Upload:** Suporte a arquivos
- ✅ **Documentação:** Completa
- ✅ **Pronto para:** Integração com front-end

---

## 🚀 Está Pronto!

O backend está **100% funcional** e aguardando apenas a configuração do MySQL local.

**Comece agora:** [GUIA-RAPIDO.md](./GUIA-RAPIDO.md) 

Boa sorte! 🎉
