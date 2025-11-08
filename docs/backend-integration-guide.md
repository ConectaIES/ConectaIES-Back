# Guia de Integração Backend - ConectaIES

**Data de Criação:** 06/11/2025  
**Versão Front-End:** Angular 20.3.0  
**Tecnologias:** Node.js, Express, Socket.IO, MySQL, Redis

---

## 📋 Índice

1. [Visão Geral](#visão-geral)
2. [Modelos de Dados](#modelos-de-dados)
3. [API REST - Endpoints](#api-rest-endpoints)
4. [WebSocket - Eventos em Tempo Real](#websocket-eventos-em-tempo-real)
5. [Regras de Negócio Críticas](#regras-de-negócio-críticas)
6. [Exemplos de Requisições](#exemplos-de-requisições)

---

## 🎯 Visão Geral

O front-end está implementado e aguardando integração com o backend. Este documento especifica **EXATAMENTE** como o backend deve ser implementado para garantir compatibilidade total.

### Base URL
```
http://localhost:3000/api
```

### Tecnologias Esperadas
- **Node.js + Express** para API REST
- **Socket.IO** para WebSocket (porta 3000)
- **MySQL** para persistência
- **Redis** para cache e sessões

---

## 📊 Modelos de Dados

### 1. Usuario

```typescript
interface Usuario {
  id: number;
  nome: string;
  email: string;
  tipoPerfil: 'ALUNO' | 'PROFESSOR' | 'ADMIN';
}
```

**Tabela MySQL:**
```sql
CREATE TABLE users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  nome VARCHAR(200) NOT NULL,
  email VARCHAR(200) NOT NULL UNIQUE,
  tipo_perfil ENUM('ALUNO', 'PROFESSOR', 'ADMIN') NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

---

### 2. Solicitacao

```typescript
interface Solicitacao {
  id: number;
  protocolo: string;              // Ex: "SOL-2025-0001"
  titulo: string;
  descricao: string;
  tipo: 'APOIO_LOCOMOCAO' | 'INTERPRETACAO_LIBRAS' | 'OUTROS';
  status: 'ABERTO' | 'NAO_VISTO' | 'EM_ANALISE' | 'EM_EXECUCAO' | 'RESOLVIDO';
  usuarioId: number;
  usuarioNome?: string;           // JOIN com tabela users
  anexos: Anexo[];
  createdAt: Date;
  updatedAt: Date;
  firstResponseAt?: Date;         // ⚠️ CRÍTICO para KPI TMR
  timeToTmrBreach?: number;       // ⚠️ Segundos restantes até violar TMR (4 horas)
}
```

**Tabela MySQL:**
```sql
CREATE TABLE solicitations (
  id INT AUTO_INCREMENT PRIMARY KEY,
  protocolo VARCHAR(50) NOT NULL UNIQUE,
  titulo VARCHAR(200) NOT NULL,
  descricao TEXT NOT NULL,
  tipo ENUM('APOIO_LOCOMOCAO', 'INTERPRETACAO_LIBRAS', 'OUTROS') NOT NULL,
  status ENUM('ABERTO', 'NAO_VISTO', 'EM_ANALISE', 'EM_EXECUCAO', 'RESOLVIDO') DEFAULT 'ABERTO',
  usuario_id INT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  first_response_at TIMESTAMP NULL,
  FOREIGN KEY (usuario_id) REFERENCES users(id)
);
```

**Campo Calculado `timeToTmrBreach`:**
```javascript
// Backend deve calcular e retornar em SEGUNDOS
const TMR_LIMIT = 4 * 60 * 60; // 4 horas em segundos
const elapsed = (Date.now() - solicitacao.created_at.getTime()) / 1000;
solicitacao.timeToTmrBreach = TMR_LIMIT - elapsed;
```

---

### 3. Anexo

```typescript
interface Anexo {
  id: number;
  nome: string;
  url: string;
  tipo: string;  // MIME type: image/jpeg, application/pdf, etc.
}
```

**Tabela MySQL:**
```sql
CREATE TABLE attachments (
  id INT AUTO_INCREMENT PRIMARY KEY,
  solicitacao_id INT NOT NULL,
  nome VARCHAR(255) NOT NULL,
  url VARCHAR(500) NOT NULL,
  tipo VARCHAR(100) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (solicitacao_id) REFERENCES solicitations(id) ON DELETE CASCADE
);
```

---

### 4. EventoHistorico

```typescript
interface EventoHistorico {
  id: number;
  solicitacaoId: number;
  eventoTipo: 'STATUS_CHANGE' | 'COMMENT' | 'ATTACHMENT';
  descricao: string;
  usuarioId?: number;
  usuarioNome?: string;
  timestamp: Date;
}
```

**Tabela MySQL:**
```sql
CREATE TABLE event_history (
  id INT AUTO_INCREMENT PRIMARY KEY,
  solicitacao_id INT NOT NULL,
  evento_tipo ENUM('STATUS_CHANGE', 'COMMENT', 'ATTACHMENT') NOT NULL,
  descricao TEXT NOT NULL,
  usuario_id INT NULL,
  timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (solicitacao_id) REFERENCES solicitations(id) ON DELETE CASCADE,
  FOREIGN KEY (usuario_id) REFERENCES users(id) ON DELETE SET NULL
);
```

---

## 🔌 API REST - Endpoints

### **POST** `/api/solicitacoes`
Criar nova solicitação (US-201)

**Request:** `multipart/form-data`
```typescript
{
  titulo: string;
  descricao: string;
  tipo: 'APOIO_LOCOMOCAO' | 'INTERPRETACAO_LIBRAS' | 'OUTROS';
  anexos?: File[];  // Máximo 3 arquivos
}
```

**Response:** `201 Created`
```json
{
  "id": 1,
  "protocolo": "SOL-2025-0001",
  "titulo": "Necessito de apoio para locomoção",
  "descricao": "...",
  "tipo": "APOIO_LOCOMOCAO",
  "status": "ABERTO",
  "usuarioId": 5,
  "usuarioNome": "João Silva",
  "anexos": [],
  "createdAt": "2025-11-06T18:00:00.000Z",
  "updatedAt": "2025-11-06T18:00:00.000Z",
  "timeToTmrBreach": 14400
}
```

**⚠️ AÇÕES OBRIGATÓRIAS após criar:**
1. Gerar protocolo único (ex: `SOL-${ano}-${sequencial}`)
2. Definir status inicial como `ABERTO`
3. Emitir evento WebSocket `nova-solicitacao` para admins
4. Criar evento no histórico (`STATUS_CHANGE`)

---

### **GET** `/api/solicitacoes/minhas`
Listar solicitações do usuário autenticado (US-202)

**Headers:**
```
Authorization: Bearer <token>
```

**Response:** `200 OK`
```json
[
  {
    "id": 1,
    "protocolo": "SOL-2025-0001",
    "titulo": "...",
    "status": "EM_ANALISE",
    "updatedAt": "2025-11-06T18:30:00.000Z",
    ...
  }
]
```

**Ordenação:** Mais recentes primeiro (`ORDER BY created_at DESC`)

---

### **GET** `/api/solicitacoes/:id`
Obter detalhes de uma solicitação (US-202)

**Response:** `200 OK`
```json
{
  "id": 1,
  "protocolo": "SOL-2025-0001",
  "titulo": "...",
  "descricao": "...",
  "tipo": "APOIO_LOCOMOCAO",
  "status": "EM_ANALISE",
  "usuarioId": 5,
  "usuarioNome": "João Silva",
  "anexos": [
    {
      "id": 1,
      "nome": "laudo.pdf",
      "url": "https://storage.../laudo.pdf",
      "tipo": "application/pdf"
    }
  ],
  "createdAt": "2025-11-06T18:00:00.000Z",
  "updatedAt": "2025-11-06T18:30:00.000Z",
  "firstResponseAt": "2025-11-06T18:30:00.000Z",
  "timeToTmrBreach": null
}
```

---

### **GET** `/api/solicitacoes/:id/historico`
Obter histórico de eventos (US-202 - CA 202.3)

**Response:** `200 OK`
```json
[
  {
    "id": 1,
    "solicitacaoId": 1,
    "eventoTipo": "STATUS_CHANGE",
    "descricao": "Solicitação criada",
    "usuarioId": 5,
    "usuarioNome": "João Silva",
    "timestamp": "2025-11-06T18:00:00.000Z"
  },
  {
    "id": 2,
    "eventoTipo": "STATUS_CHANGE",
    "descricao": "Status alterado para EM_ANALISE",
    "usuarioId": 1,
    "usuarioNome": "Admin Maria",
    "timestamp": "2025-11-06T18:30:00.000Z"
  }
]
```

**Ordenação:** Cronológica (`ORDER BY timestamp ASC`)

---

### **POST** `/api/solicitacoes/:id/comentarios`
Adicionar comentário (US-202 - CA 202.4)

**Request:**
```json
{
  "comentario": "Texto do comentário"
}
```

**Response:** `201 Created`
```json
{
  "id": 3,
  "solicitacaoId": 1,
  "eventoTipo": "COMMENT",
  "descricao": "Texto do comentário",
  "usuarioId": 5,
  "usuarioNome": "João Silva",
  "timestamp": "2025-11-06T19:00:00.000Z"
}
```

**⚠️ AÇÕES OBRIGATÓRIAS:**
- Criar registro em `event_history`
- Emitir WebSocket `atualizacao-status` para notificar admin

---

### **PATCH** `/api/solicitacoes/:id/resolver`
Marcar como resolvida (US-202 - CA 202.5)

**Response:** `200 OK`
```json
{
  "id": 1,
  "status": "RESOLVIDO",
  "updatedAt": "2025-11-06T20:00:00.000Z",
  ...
}
```

**⚠️ AÇÕES OBRIGATÓRIAS:**
- Atualizar status para `RESOLVIDO`
- Criar evento no histórico
- Emitir WebSocket `atualizacao-status`

---

### **GET** `/api/solicitacoes/admin/novas`
Listar solicitações para dashboard admin (US-401)

**Headers:**
```
Authorization: Bearer <admin-token>
```

**Response:** `200 OK`
```json
[
  {
    "id": 1,
    "protocolo": "SOL-2025-0001",
    "titulo": "...",
    "status": "ABERTO",
    "usuarioNome": "João Silva",
    "createdAt": "2025-11-06T18:00:00.000Z",
    "timeToTmrBreach": 3600  // ⚠️ 1 hora restante - URGENTE!
  }
]
```

**Filtros:**
- Status: `ABERTO`, `NAO_VISTO`, `EM_ANALISE`, `EM_EXECUCAO`
- Ordenação: Por `timeToTmrBreach` ASC (mais urgentes primeiro)

---

### **PATCH** `/api/solicitacoes/:id/atribuir`
Atribuir solicitação a um usuário (US-401 - CA 401.4)

**Request:**
```json
{
  "usuarioId": 2,
  "nota": "Atribuído ao João para análise"
}
```

**Response:** `200 OK`

**⚠️ AÇÕES OBRIGATÓRIAS:**
- Alterar status para `EM_ANALISE`
- Criar evento no histórico
- Emitir WebSocket

---

### **POST** `/api/solicitacoes/:id/primeira-resposta`
Enviar primeira resposta ao usuário (US-401 - CA 401.5)

**Request:**
```json
{
  "resposta": "Olá, recebemos sua solicitação..."
}
```

**Response:** `200 OK`

**⚠️ AÇÕES CRÍTICAS (KPI TMR):**
1. **Atualizar `first_response_at = NOW()`** - ESSENCIAL para cálculo do TMR
2. Alterar status para `EM_EXECUCAO`
3. Criar evento no histórico com a resposta
4. Emitir WebSocket `atualizacao-status` para o usuário
5. Zerar `timeToTmrBreach` nas próximas requisições

---

## 🔄 WebSocket - Eventos em Tempo Real

### Configuração Socket.IO

**Servidor:**
```javascript
const io = require('socket.io')(server, {
  cors: {
    origin: 'http://localhost:4200',
    methods: ['GET', 'POST']
  }
});

io.on('connection', (socket) => {
  console.log('Cliente conectado:', socket.id);
  
  // Autenticação opcional
  socket.on('authenticate', (token) => {
    // Validar token e armazenar userId no socket
  });
});
```

---

### Evento: `nova-solicitacao`

**Quando emitir:** Imediatamente após criar uma nova solicitação

**Direção:** Backend → Front-End (Admin)

**Payload:**
```json
{
  "id": 1,
  "protocolo": "SOL-2025-0001",
  "titulo": "...",
  "status": "ABERTO",
  "usuarioNome": "João Silva",
  "createdAt": "2025-11-06T18:00:00.000Z",
  "timeToTmrBreach": 14400
}
```

**Código Backend:**
```javascript
io.emit('nova-solicitacao', solicitacao);
```

**Front-End esperando:**
```typescript
this.socket.on('nova-solicitacao', (solicitacao: Solicitacao) => {
  // Adiciona à lista do dashboard admin
});
```

---

### Evento: `atualizacao-status`

**Quando emitir:** Sempre que o status de uma solicitação mudar

**Direção:** Backend → Front-End (Usuário + Admin)

**Payload:**
```json
{
  "solicitacaoId": 1,
  "status": "EM_ANALISE",
  "timestamp": "2025-11-06T18:30:00.000Z"
}
```

**Código Backend:**
```javascript
io.emit('atualizacao-status', {
  solicitacaoId: solicitacao.id,
  status: solicitacao.status,
  timestamp: new Date()
});
```

**Front-End esperando:**
```typescript
this.socket.on('atualizacao-status', (update) => {
  // Atualiza status na lista
});
```

---

## ⚠️ Regras de Negócio Críticas

### 1. Geração de Protocolo
```javascript
// Formato: SOL-YYYY-NNNN
async function gerarProtocolo() {
  const ano = new Date().getFullYear();
  const count = await db.query(
    'SELECT COUNT(*) as total FROM solicitations WHERE YEAR(created_at) = ?',
    [ano]
  );
  const sequencial = String(count.total + 1).padStart(4, '0');
  return `SOL-${ano}-${sequencial}`;
}
```

### 2. Cálculo do TMR (Tempo Médio de Resposta)

**Limite:** 4 horas (14.400 segundos)

**Cálculo `timeToTmrBreach`:**
```javascript
function calcularTimeToTmrBreach(solicitacao) {
  // Se já teve primeira resposta, retorna null
  if (solicitacao.first_response_at) {
    return null;
  }
  
  const TMR_LIMIT = 4 * 60 * 60; // 4 horas
  const elapsed = (Date.now() - solicitacao.created_at.getTime()) / 1000;
  const remaining = TMR_LIMIT - elapsed;
  
  return remaining > 0 ? remaining : 0;
}
```

**⚠️ Este campo DEVE ser calculado em TODAS as consultas de solicitações**

### 3. Status da Solicitação - Fluxo

```
ABERTO (criação)
  ↓
NAO_VISTO (admin ainda não visualizou)
  ↓
EM_ANALISE (admin visualizou/atribuiu)
  ↓
EM_EXECUCAO (primeira resposta enviada) ← ⚠️ Atualiza first_response_at
  ↓
RESOLVIDO (finalizada)
```

### 4. Upload de Anexos

**Limitações:**
- Máximo 3 arquivos por solicitação
- Tamanho máximo: 5MB por arquivo
- Tipos aceitos: `image/*`, `.pdf`, `.doc`, `.docx`

**Armazenamento sugerido:**
- AWS S3, Google Cloud Storage ou servidor local
- Retornar URL pública acessível

**Validação:**
```javascript
if (req.files && req.files.length > 3) {
  return res.status(400).json({ error: 'Máximo de 3 anexos permitidos' });
}
```

### 5. Histórico de Eventos

**Criar evento SEMPRE que:**
- Solicitação for criada
- Status mudar
- Comentário for adicionado
- Anexo for adicionado
- Solicitação for atribuída
- Primeira resposta for enviada

**Exemplo:**
```javascript
await db.query(
  'INSERT INTO event_history (solicitacao_id, evento_tipo, descricao, usuario_id) VALUES (?, ?, ?, ?)',
  [solicitacaoId, 'STATUS_CHANGE', `Status alterado para ${novoStatus}`, usuarioId]
);
```

---

## 📝 Exemplos de Requisições Completas

### Exemplo 1: Criar Solicitação

**Request:**
```bash
curl -X POST http://localhost:3000/api/solicitacoes \
  -H "Content-Type: multipart/form-data" \
  -H "Authorization: Bearer eyJhbGc..." \
  -F "titulo=Necessito intérprete de Libras" \
  -F "descricao=Preciso de um intérprete para acompanhar as aulas de segunda a sexta" \
  -F "tipo=INTERPRETACAO_LIBRAS" \
  -F "anexos=@laudo.pdf"
```

**Backend deve:**
1. Validar token de autenticação
2. Gerar protocolo único
3. Salvar anexo e gerar URL
4. Inserir no MySQL
5. Criar evento inicial no histórico
6. **Emitir WebSocket `nova-solicitacao`**
7. Retornar objeto completo

---

### Exemplo 2: Primeira Resposta (Admin)

**Request:**
```bash
curl -X POST http://localhost:3000/api/solicitacoes/1/primeira-resposta \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer admin-token" \
  -d '{
    "resposta": "Olá! Recebemos sua solicitação e já estamos providenciando o intérprete."
  }'
```

**Backend DEVE:**
1. Validar que usuário é ADMIN
2. **UPDATE `first_response_at = NOW()`** ← CRÍTICO!
3. Alterar status para `EM_EXECUCAO`
4. Criar evento no histórico com a resposta
5. **Emitir WebSocket `atualizacao-status`**
6. Retornar solicitação atualizada

---

## 🎯 Checklist de Implementação Backend

- [ ] Estrutura MySQL com todas as tabelas
- [ ] Geração automática de protocolos únicos
- [ ] Upload de arquivos (máx 3, 5MB cada)
- [ ] Cálculo de `timeToTmrBreach` em todas as consultas
- [ ] Atualização de `first_response_at` na primeira resposta
- [ ] Socket.IO configurado na porta 3000
- [ ] Emissão de `nova-solicitacao` ao criar
- [ ] Emissão de `atualizacao-status` ao mudar status
- [ ] Histórico de eventos completo
- [ ] Autenticação e autorização (JWT sugerido)
- [ ] Validação de perfis (ALUNO, PROFESSOR, ADMIN)
- [ ] CORS habilitado para http://localhost:4200

---

## 🚨 Pontos de Atenção

1. **`first_response_at`** é ESSENCIAL para o KPI de TMR - não esquecer de atualizar!
2. **`timeToTmrBreach`** deve ser calculado dinamicamente em TODAS as consultas
3. **WebSocket** deve estar na mesma porta da API (3000) ou configurar CORS
4. **Protocolo** deve ser único e sequencial por ano
5. **Histórico** deve registrar TODOS os eventos para transparência
6. **Status** devem seguir exatamente os valores enum definidos

---

## 📞 Contato

**Dúvidas sobre integração:** Verificar este documento primeiro  
**Front-End Disponível em:** http://localhost:4200/  
**API Esperada em:** http://localhost:3000/api

**Última Atualização:** 06/11/2025
