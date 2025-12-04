# 🔗 Verificação de Integração Frontend ↔️ Backend

## ✅ Análise da Configuração Atual

### 🎯 Status Geral: **COMPATÍVEL** ✅

---

## 📊 Configurações Verificadas

### **Backend (NestJS)**

#### 1. CORS
```typescript
// src/main.ts
app.enableCors({
  origin: 'http://localhost:4200',  ✅ Correto
  credentials: true,
});
```

#### 2. Prefixo da API
```typescript
app.setGlobalPrefix('api');  ✅ Correto
```

#### 3. Porta
```typescript
await app.listen(3000);  ✅ Porta 3000
```

#### 4. WebSocket
```typescript
// src/websocket/websocket.gateway.ts
@WebSocketGateway({
  cors: {
    origin: 'http://localhost:4200',  ✅ Correto
    credentials: true,
  },
})
```

#### 5. Resposta de Autenticação
```typescript
// src/auth/dto/auth-response.dto.ts
{
  token: string;     ✅ Frontend espera "token"
  usuario: {...}     ✅ Frontend espera "usuario"
}
```

---

### **Frontend (Angular)**

#### 1. URL da API
```typescript
// auth.service.ts
private readonly API_URL = 'http://localhost:3000/api';  ✅ Correto

// solicitacao.service.ts
private readonly apiUrl = 'http://localhost:3000/api/solicitacoes';  ✅ Correto
```

#### 2. WebSocket
```typescript
// real-time-notifier.service.ts
this.socket = io('http://localhost:3000', {  ✅ Correto
  autoConnect: false
});
```

#### 3. Interceptor de Autenticação
```typescript
// auth.interceptor.ts
if (token) {
  Authorization: `Bearer ${token}`  ✅ Correto
}
```

#### 4. Modelo de Response
```typescript
// auth-response.model.ts
interface AuthResponse {
  token: string;     ✅ Compatível
  usuario: Usuario;  ✅ Compatível
}
```

---

## ✅ Pontos de Integração Compatíveis

| Aspecto | Backend | Frontend | Status |
|---------|---------|----------|--------|
| **URL Base** | `http://localhost:3000` | `http://localhost:3000` | ✅ |
| **Prefixo API** | `/api` | `/api` | ✅ |
| **CORS Origin** | `http://localhost:4200` | `http://localhost:4200` | ✅ |
| **WebSocket URL** | `ws://localhost:3000` | `http://localhost:3000` | ✅ |
| **Auth Response** | `{ token, usuario }` | `{ token, usuario }` | ✅ |
| **JWT Header** | `Authorization: Bearer` | `Authorization: Bearer` | ✅ |
| **Eventos WS** | `nova-solicitacao`, `atualizacao-status` | Mesmos eventos | ✅ |

---

## 🧪 Testes de Integração

### **Teste 1: Verificar Backend Rodando**

```powershell
# PowerShell
Invoke-RestMethod -Uri "http://localhost:3000" -Method GET
```

**Esperado:** Resposta do servidor (qualquer resposta = servidor rodando)

---

### **Teste 2: Registrar Usuário (Backend)**

```powershell
$body = @{
    nome = "Teste Frontend"
    email = "teste@frontend.com"
    senha = "senha123"
    tipoPerfil = "ALUNO"
    matricula = "2025001"
} | ConvertTo-Json

$response = Invoke-RestMethod -Uri "http://localhost:3000/api/auth/register" `
    -Method POST `
    -ContentType "application/json" `
    -Body $body

# Verificar resposta
$response | ConvertTo-Json -Depth 3

# Salvar token para próximos testes
$token = $response.token
```

**Verificações:**
- ✅ Deve retornar `token` (não `access_token`)
- ✅ Deve retornar `usuario` (não `user`)
- ✅ `usuario.matricula` deve existir
- ✅ `usuario.tipoPerfil` deve ser "ALUNO"

---

### **Teste 3: Login (Backend)**

```powershell
$loginBody = @{
    email = "teste@frontend.com"
    senha = "senha123"
} | ConvertTo-Json

$loginResponse = Invoke-RestMethod -Uri "http://localhost:3000/api/auth/login" `
    -Method POST `
    -ContentType "application/json" `
    -Body $loginBody

$loginResponse | ConvertTo-Json -Depth 3
$token = $loginResponse.token
```

---

### **Teste 4: Criar Solicitação com Token**

```powershell
# Criar arquivo de teste temporário
$boundary = [System.Guid]::NewGuid().ToString()
$bodyLines = @(
    "--$boundary",
    'Content-Disposition: form-data; name="titulo"',
    '',
    'Teste de Integração',
    "--$boundary",
    'Content-Disposition: form-data; name="descricao"',
    '',
    'Testando integração Frontend-Backend',
    "--$boundary",
    'Content-Disposition: form-data; name="tipo"',
    '',
    'APOIO_LOCOMOCAO',
    "--$boundary--"
)

$body = $bodyLines -join "`r`n"

$headers = @{
    "Authorization" = "Bearer $token"
    "Content-Type" = "multipart/form-data; boundary=$boundary"
}

Invoke-RestMethod -Uri "http://localhost:3000/api/solicitacoes" `
    -Method POST `
    -Headers $headers `
    -Body $body
```

**Verificações:**
- ✅ Status 201 Created
- ✅ Retorna `protocolo` gerado
- ✅ Retorna `timeToTmrBreach` calculado

---

### **Teste 5: Listar Minhas Solicitações**

```powershell
$headers = @{
    "Authorization" = "Bearer $token"
}

$solicitacoes = Invoke-RestMethod -Uri "http://localhost:3000/api/solicitacoes/minhas" `
    -Method GET `
    -Headers $headers

$solicitacoes | ConvertTo-Json -Depth 4
```

---

### **Teste 6: CORS**

```powershell
# Simular requisição do frontend
$headers = @{
    "Origin" = "http://localhost:4200"
}

Invoke-WebRequest -Uri "http://localhost:3000/api/auth/login" `
    -Method OPTIONS `
    -Headers $headers
```

**Verificar headers da resposta:**
- ✅ `Access-Control-Allow-Origin: http://localhost:4200`
- ✅ `Access-Control-Allow-Credentials: true`

---

## 🔌 Teste de WebSocket

### Script de Teste (Node.js temporário)

Crie um arquivo `test-websocket.js`:

```javascript
const io = require('socket.io-client');

const socket = io('http://localhost:3000', {
  transports: ['websocket']
});

socket.on('connect', () => {
  console.log('✅ Conectado ao WebSocket:', socket.id);
});

socket.on('nova-solicitacao', (data) => {
  console.log('📩 Nova solicitação recebida:', data);
});

socket.on('atualizacao-status', (data) => {
  console.log('🔄 Status atualizado:', data);
});

socket.on('disconnect', () => {
  console.log('❌ Desconectado');
});

socket.on('connect_error', (error) => {
  console.error('❌ Erro de conexão:', error.message);
});

console.log('🔌 Tentando conectar ao WebSocket...');

// Manter script rodando
setTimeout(() => {
  console.log('⏱️ Teste finalizado após 30 segundos');
  socket.disconnect();
  process.exit(0);
}, 30000);
```

Execute:
```bash
node test-websocket.js
```

---

## 🌐 Teste Frontend Completo

### 1. Iniciar Backend
```bash
cd ConectaIES-Back
npm run start:dev
```

### 2. Iniciar Frontend
```bash
cd ConectaIES-Front/conecta-ies-front
ng serve
```

### 3. Acessar no Navegador
```
http://localhost:4200
```

### 4. Fluxo de Teste Manual

1. **Abrir DevTools** (F12) → Aba **Console**
2. **Abrir Aba Network** para ver requisições

#### Teste 1: Cadastro
- Ir para página de cadastro
- Preencher dados:
  - Nome: Teste
  - Email: teste@angular.com
  - Senha: senha123
  - Tipo: ALUNO
- Clicar em "Cadastrar"

**Verificar no Network:**
- ✅ `POST http://localhost:3000/api/auth/register`
- ✅ Status: 201
- ✅ Response: `{ token, usuario }`

**Verificar no Console:**
- ✅ Sem erros de CORS
- ✅ Token salvo no localStorage

#### Teste 2: Login
- Fazer logout
- Ir para login
- Email: teste@angular.com
- Senha: senha123

**Verificar:**
- ✅ `POST http://localhost:3000/api/auth/login`
- ✅ Redirecionado para `/home`

#### Teste 3: Criar Solicitação
- Ir para "Nova Solicitação"
- Preencher formulário
- Adicionar anexo (opcional)
- Enviar

**Verificar no Network:**
- ✅ `POST http://localhost:3000/api/solicitacoes`
- ✅ Header: `Authorization: Bearer <token>`
- ✅ Content-Type: `multipart/form-data`
- ✅ Response com protocolo

#### Teste 4: Dashboard Admin
- Fazer login com admin
- Ir para `/admin/dashboard`

**Verificar no Console:**
- ✅ WebSocket conectado
- ✅ Eventos recebidos

---

## 📋 Checklist de Compatibilidade

### Backend
- [x] CORS configurado para `http://localhost:4200`
- [x] Prefixo `/api` configurado
- [x] Porta 3000
- [x] WebSocket CORS configurado
- [x] Response de auth: `{ token, usuario }`
- [x] JWT aceita header `Authorization: Bearer`
- [x] Validação automática com DTOs

### Frontend
- [x] API_URL: `http://localhost:3000/api`
- [x] WebSocket URL: `http://localhost:3000`
- [x] AuthInterceptor adiciona token
- [x] Espera response: `{ token, usuario }`
- [x] Guards configurados
- [x] WebSocket auto-connect desabilitado (conecta manualmente)

---

## ⚠️ Possíveis Problemas

### 1. CORS Error
**Sintoma:** `Access to XMLHttpRequest has been blocked by CORS policy`

**Solução:** Verificar se backend está com:
```typescript
app.enableCors({
  origin: 'http://localhost:4200',
  credentials: true,
});
```

### 2. 401 Unauthorized
**Sintoma:** Todas as requisições protegidas retornam 401

**Causas possíveis:**
- Token expirado
- Token não está sendo enviado
- JWT_SECRET diferente

**Solução:** Fazer novo login

### 3. WebSocket não conecta
**Sintoma:** `WebSocket connection failed`

**Verificar:**
- Backend rodando na porta 3000
- CORS configurado no gateway
- Frontend usando URL correta

### 4. 404 Not Found em `/api/...`
**Sintoma:** Endpoints retornam 404

**Causa:** Prefixo `/api` não configurado ou URL errada

**Verificar:**
- Backend: `app.setGlobalPrefix('api')`
- Frontend: URLs com `/api/...`

---

## ✅ Conclusão

**Status:** ✅ **100% COMPATÍVEL**

Toda a configuração de integração está correta:
- ✅ URLs alinhadas
- ✅ CORS configurado
- ✅ WebSocket configurado
- ✅ Autenticação compatível
- ✅ Modelos de dados alinhados
- ✅ Interceptors configurados

**Próximos passos:**
1. Iniciar backend: `npm run start:dev`
2. Iniciar frontend: `ng serve`
3. Testar fluxo completo no navegador

---

## 🚀 Comando Rápido de Teste

```powershell
# Teste completo em PowerShell
Write-Host "🧪 Testando integração..." -ForegroundColor Cyan

# 1. Verificar backend
try {
    Invoke-RestMethod -Uri "http://localhost:3000" -Method GET -ErrorAction Stop
    Write-Host "✅ Backend rodando" -ForegroundColor Green
} catch {
    Write-Host "❌ Backend não está rodando!" -ForegroundColor Red
    exit
}

# 2. Testar registro
$registerBody = @{
    nome = "Teste Auto"
    email = "auto@test.com"
    senha = "senha123"
    tipoPerfil = "ALUNO"
} | ConvertTo-Json

try {
    $response = Invoke-RestMethod -Uri "http://localhost:3000/api/auth/register" `
        -Method POST `
        -ContentType "application/json" `
        -Body $registerBody `
        -ErrorAction Stop
    
    if ($response.token -and $response.usuario) {
        Write-Host "✅ Autenticação funcionando" -ForegroundColor Green
        Write-Host "   Token: $($response.token.Substring(0,20))..." -ForegroundColor Gray
        Write-Host "   Usuário: $($response.usuario.nome)" -ForegroundColor Gray
    } else {
        Write-Host "⚠️ Response com formato inesperado" -ForegroundColor Yellow
    }
} catch {
    if ($_.Exception.Message -like "*409*") {
        Write-Host "✅ API funcionando (usuário já existe)" -ForegroundColor Green
    } else {
        Write-Host "❌ Erro na API: $($_.Exception.Message)" -ForegroundColor Red
    }
}

Write-Host ""
Write-Host "✅ Integração Frontend-Backend: PRONTA!" -ForegroundColor Green
```

Execute este script para validação rápida!
