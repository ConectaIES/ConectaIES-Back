# 📡 Exemplos de Requisições - ConectaIES API

Este arquivo contém exemplos práticos de como testar todos os endpoints da API usando **PowerShell**, **cURL** e **JavaScript**.

---

## 📋 Índice

1. [Autenticação](#autenticação)
2. [Solicitações - Usuário](#solicitações---usuário)
3. [Solicitações - Admin](#solicitações---admin)
4. [Upload de Arquivos](#upload-de-arquivos)
5. [WebSocket](#websocket)

---

## Autenticação

### 1. Registrar Usuário

**PowerShell:**
```powershell
$body = @{
    nome = "Admin Teste"
    email = "admin@test.com"
    senha = "senha123"
    tipoPerfil = "ADMIN"
    matricula = "ADM2025001"
} | ConvertTo-Json

Invoke-RestMethod -Uri "http://localhost:3000/api/auth/register" `
    -Method POST `
    -ContentType "application/json" `
    -Body $body
```

**cURL (Git Bash / Linux / Mac):**
```bash
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "nome": "Admin Teste",
    "email": "admin@test.com",
    "senha": "senha123",
    "tipoPerfil": "ADMIN",
    "matricula": "ADM2025001"
  }'
```

**JavaScript (Fetch API):**
```javascript
fetch('http://localhost:3000/api/auth/register', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    nome: 'Admin Teste',
    email: 'admin@test.com',
    senha: 'senha123',
    tipoPerfil: 'ADMIN',
    matricula: 'ADM2025001'
  })
})
  .then(res => res.json())
  .then(data => console.log(data));
```

**Resposta:**
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "usuario": {
    "id": 1,
    "nome": "Admin Teste",
    "email": "admin@test.com",
    "tipoPerfil": "ADMIN",
    "matricula": "ADM2025001",
    "createdAt": "2025-11-21T10:00:00.000Z"
  }
}
```

⚠️ **Copie o `token` para usar nas próximas requisições!**

---

### 2. Login

**PowerShell:**
```powershell
$body = @{
    email = "admin@test.com"
    senha = "senha123"
} | ConvertTo-Json

$response = Invoke-RestMethod -Uri "http://localhost:3000/api/auth/login" `
    -Method POST `
    -ContentType "application/json" `
    -Body $body

# Salvar token para usar depois
$token = $response.token
Write-Host "Token: $token"
```

**cURL:**
```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@test.com",
    "senha": "senha123"
  }'
```

**JavaScript:**
```javascript
fetch('http://localhost:3000/api/auth/login', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    email: 'admin@test.com',
    senha: 'senha123'
  })
})
  .then(res => res.json())
  .then(data => {
    localStorage.setItem('conecta_ies_token', data.token);
    localStorage.setItem('conecta_ies_user', JSON.stringify(data.usuario));
    console.log('Token salvo:', data.token);
  });
```

**Resposta:**
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "usuario": {
    "id": 1,
    "nome": "Admin Teste",
    "email": "admin@test.com",
    "tipoPerfil": "ADMIN",
    "matricula": "ADM2025001",
    "createdAt": "2025-11-21T10:00:00.000Z"
  }
}
```

---

## Solicitações - Usuário

⚠️ **Todas as requisições abaixo requerem autenticação!**  
Substitua `SEU_TOKEN_AQUI` pelo token obtido no login.

---

### 3. Criar Solicitação (sem anexos)

**PowerShell:**
```powershell
$token = "SEU_TOKEN_AQUI"
$headers = @{
    "Authorization" = "Bearer $token"
    "Content-Type" = "application/json"
}
$body = @{
    titulo = "Necessito de apoio para locomoção"
    descricao = "Preciso de ajuda para me locomover no campus devido a minha condição"
    tipo = "APOIO_LOCOMOCAO"
} | ConvertTo-Json

Invoke-RestMethod -Uri "http://localhost:3000/api/solicitacoes" `
    -Method POST `
    -Headers $headers `
    -Body $body
```

**cURL:**
```bash
TOKEN="SEU_TOKEN_AQUI"

curl -X POST http://localhost:3000/api/solicitacoes \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "titulo": "Necessito de apoio para locomoção",
    "descricao": "Preciso de ajuda para me locomover no campus",
    "tipo": "APOIO_LOCOMOCAO"
  }'
```

**JavaScript:**
```javascript
const token = localStorage.getItem('token');

fetch('http://localhost:3000/api/solicitacoes', {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    titulo: 'Necessito de apoio para locomoção',
    descricao: 'Preciso de ajuda para me locomover no campus',
    tipo: 'APOIO_LOCOMOCAO'
  })
})
  .then(res => res.json())
  .then(data => console.log('Solicitação criada:', data));
```

**Tipos de solicitação válidos:**
- `APOIO_LOCOMOCAO`
- `INTERPRETACAO_LIBRAS`
- `OUTROS`

---

### 4. Listar Minhas Solicitações

**PowerShell:**
```powershell
$token = "SEU_TOKEN_AQUI"
$headers = @{
    "Authorization" = "Bearer $token"
}

Invoke-RestMethod -Uri "http://localhost:3000/api/solicitacoes/minhas" `
    -Method GET `
    -Headers $headers
```

**cURL:**
```bash
curl -X GET http://localhost:3000/api/solicitacoes/minhas \
  -H "Authorization: Bearer $TOKEN"
```

**JavaScript:**
```javascript
fetch('http://localhost:3000/api/solicitacoes/minhas', {
  headers: {
    'Authorization': `Bearer ${localStorage.getItem('token')}`
  }
})
  .then(res => res.json())
  .then(data => console.log('Minhas solicitações:', data));
```

---

### 5. Obter Detalhes de uma Solicitação

**PowerShell:**
```powershell
$token = "SEU_TOKEN_AQUI"
$solicitacaoId = 1  # Trocar pelo ID desejado

$headers = @{
    "Authorization" = "Bearer $token"
}

Invoke-RestMethod -Uri "http://localhost:3000/api/solicitacoes/$solicitacaoId" `
    -Method GET `
    -Headers $headers
```

**cURL:**
```bash
SOLICITACAO_ID=1

curl -X GET "http://localhost:3000/api/solicitacoes/$SOLICITACAO_ID" \
  -H "Authorization: Bearer $TOKEN"
```

**JavaScript:**
```javascript
const solicitacaoId = 1;

fetch(`http://localhost:3000/api/solicitacoes/${solicitacaoId}`, {
  headers: {
    'Authorization': `Bearer ${localStorage.getItem('token')}`
  }
})
  .then(res => res.json())
  .then(data => console.log('Detalhes:', data));
```

---

### 6. Obter Histórico de uma Solicitação

**PowerShell:**
```powershell
$token = "SEU_TOKEN_AQUI"
$solicitacaoId = 1

$headers = @{
    "Authorization" = "Bearer $token"
}

Invoke-RestMethod -Uri "http://localhost:3000/api/solicitacoes/$solicitacaoId/historico" `
    -Method GET `
    -Headers $headers
```

**cURL:**
```bash
curl -X GET "http://localhost:3000/api/solicitacoes/1/historico" \
  -H "Authorization: Bearer $TOKEN"
```

---

### 7. Adicionar Comentário

**PowerShell:**
```powershell
$token = "SEU_TOKEN_AQUI"
$solicitacaoId = 1

$headers = @{
    "Authorization" = "Bearer $token"
    "Content-Type" = "application/json"
}
$body = @{
    comentario = "Gostaria de mais informações sobre o andamento"
} | ConvertTo-Json

Invoke-RestMethod -Uri "http://localhost:3000/api/solicitacoes/$solicitacaoId/comentarios" `
    -Method POST `
    -Headers $headers `
    -Body $body
```

**cURL:**
```bash
curl -X POST "http://localhost:3000/api/solicitacoes/1/comentarios" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "comentario": "Gostaria de mais informações sobre o andamento"
  }'
```

**JavaScript:**
```javascript
fetch('http://localhost:3000/api/solicitacoes/1/comentarios', {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${localStorage.getItem('token')}`,
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    comentario: 'Gostaria de mais informações sobre o andamento'
  })
})
  .then(res => res.json())
  .then(data => console.log('Comentário adicionado:', data));
```

---

### 8. Marcar como Resolvida

**PowerShell:**
```powershell
$token = "SEU_TOKEN_AQUI"
$solicitacaoId = 1

$headers = @{
    "Authorization" = "Bearer $token"
}

Invoke-RestMethod -Uri "http://localhost:3000/api/solicitacoes/$solicitacaoId/resolver" `
    -Method PATCH `
    -Headers $headers
```

**cURL:**
```bash
curl -X PATCH "http://localhost:3000/api/solicitacoes/1/resolver" \
  -H "Authorization: Bearer $TOKEN"
```

---

## Solicitações - Admin

⚠️ **Requer token de usuário com perfil ADMIN**

---

### 9. Listar Novas Solicitações (Dashboard Admin)

**PowerShell:**
```powershell
$adminToken = "SEU_TOKEN_ADMIN_AQUI"
$headers = @{
    "Authorization" = "Bearer $adminToken"
}

Invoke-RestMethod -Uri "http://localhost:3000/api/solicitacoes/admin/novas" `
    -Method GET `
    -Headers $headers
```

**cURL:**
```bash
curl -X GET "http://localhost:3000/api/solicitacoes/admin/novas" \
  -H "Authorization: Bearer $ADMIN_TOKEN"
```

---

### 10. Atribuir Solicitação

**PowerShell:**
```powershell
$adminToken = "SEU_TOKEN_ADMIN_AQUI"
$solicitacaoId = 1

$headers = @{
    "Authorization" = "Bearer $adminToken"
    "Content-Type" = "application/json"
}
$body = @{
    usuarioId = 2
    nota = "Atribuído ao João para análise e providências"
} | ConvertTo-Json

Invoke-RestMethod -Uri "http://localhost:3000/api/solicitacoes/$solicitacaoId/atribuir" `
    -Method PATCH `
    -Headers $headers `
    -Body $body
```

**cURL:**
```bash
curl -X PATCH "http://localhost:3000/api/solicitacoes/1/atribuir" \
  -H "Authorization: Bearer $ADMIN_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "usuarioId": 2,
    "nota": "Atribuído ao João para análise"
  }'
```

---

### 11. Enviar Primeira Resposta (⚠️ CRÍTICO para TMR)

**PowerShell:**
```powershell
$adminToken = "SEU_TOKEN_ADMIN_AQUI"
$solicitacaoId = 1

$headers = @{
    "Authorization" = "Bearer $adminToken"
    "Content-Type" = "application/json"
}
$body = @{
    resposta = "Olá! Recebemos sua solicitação e já estamos providenciando o apoio necessário. Em breve você será contatado."
} | ConvertTo-Json

Invoke-RestMethod -Uri "http://localhost:3000/api/solicitacoes/$solicitacaoId/primeira-resposta" `
    -Method POST `
    -Headers $headers `
    -Body $body
```

**cURL:**
```bash
curl -X POST "http://localhost:3000/api/solicitacoes/1/primeira-resposta" \
  -H "Authorization: Bearer $ADMIN_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "resposta": "Olá! Recebemos sua solicitação e já estamos providenciando o apoio necessário."
  }'
```

**JavaScript:**
```javascript
fetch('http://localhost:3000/api/solicitacoes/1/primeira-resposta', {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${adminToken}`,
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    resposta: 'Olá! Recebemos sua solicitação e já estamos providenciando o apoio.'
  })
})
  .then(res => res.json())
  .then(data => {
    console.log('Primeira resposta enviada!');
    console.log('firstResponseAt atualizado:', data.firstResponseAt);
    console.log('timeToTmrBreach agora é null:', data.timeToTmrBreach);
  });
```

⚠️ **Esta requisição atualiza o campo `firstResponseAt` no banco, zerando o contador de TMR!**

---

## Upload de Arquivos

### 12. Criar Solicitação com Anexos

**PowerShell:**
```powershell
$token = "SEU_TOKEN_AQUI"

# Caminho dos arquivos
$arquivo1 = "C:\caminho\para\arquivo1.pdf"
$arquivo2 = "C:\caminho\para\imagem.jpg"

# Criar boundary para multipart/form-data
$boundary = [System.Guid]::NewGuid().ToString()

# Montar corpo da requisição
$LF = "`r`n"
$bodyLines = (
    "--$boundary",
    "Content-Disposition: form-data; name=`"titulo`"$LF",
    "Necessito de intérprete de Libras",
    "--$boundary",
    "Content-Disposition: form-data; name=`"descricao`"$LF",
    "Preciso de intérprete para acompanhar as aulas",
    "--$boundary",
    "Content-Disposition: form-data; name=`"tipo`"$LF",
    "INTERPRETACAO_LIBRAS",
    "--$boundary",
    "Content-Disposition: form-data; name=`"anexos`"; filename=`"arquivo1.pdf`"",
    "Content-Type: application/pdf$LF",
    [System.IO.File]::ReadAllText($arquivo1),
    "--$boundary--$LF"
) -join $LF

Invoke-RestMethod -Uri "http://localhost:3000/api/solicitacoes" `
    -Method POST `
    -Headers @{
        "Authorization" = "Bearer $token"
        "Content-Type" = "multipart/form-data; boundary=$boundary"
    } `
    -Body $bodyLines
```

**cURL (mais fácil para upload):**
```bash
curl -X POST http://localhost:3000/api/solicitacoes \
  -H "Authorization: Bearer $TOKEN" \
  -F "titulo=Necessito de intérprete de Libras" \
  -F "descricao=Preciso de intérprete para as aulas" \
  -F "tipo=INTERPRETACAO_LIBRAS" \
  -F "anexos=@/caminho/para/arquivo1.pdf" \
  -F "anexos=@/caminho/para/imagem.jpg"
```

**JavaScript (HTML Form):**
```html
<form id="formSolicitacao" enctype="multipart/form-data">
  <input type="text" name="titulo" placeholder="Título" required>
  <textarea name="descricao" placeholder="Descrição" required></textarea>
  <select name="tipo" required>
    <option value="APOIO_LOCOMOCAO">Apoio Locomoção</option>
    <option value="INTERPRETACAO_LIBRAS">Interpretação Libras</option>
    <option value="OUTROS">Outros</option>
  </select>
  <input type="file" name="anexos" multiple accept=".pdf,.jpg,.png,.doc,.docx" max="3">
  <button type="submit">Enviar</button>
</form>

<script>
document.getElementById('formSolicitacao').addEventListener('submit', async (e) => {
  e.preventDefault();
  
  const formData = new FormData(e.target);
  const token = localStorage.getItem('token');
  
  const response = await fetch('http://localhost:3000/api/solicitacoes', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`
    },
    body: formData
  });
  
  const data = await response.json();
  console.log('Solicitação criada com anexos:', data);
});
</script>
```

**Limitações de upload:**
- Máximo: **3 arquivos**
- Tamanho: **5MB por arquivo**
- Tipos aceitos: `.jpg`, `.png`, `.pdf`, `.doc`, `.docx`

---

## WebSocket

### 13. Conectar ao WebSocket

**JavaScript (Browser):**
```html
<script src="https://cdn.socket.io/4.5.4/socket.io.min.js"></script>
<script>
// Conectar ao WebSocket
const socket = io('http://localhost:3000', {
  transports: ['websocket', 'polling']
});

// Evento de conexão
socket.on('connect', () => {
  console.log('✅ WebSocket conectado!', socket.id);
});

// Escutar nova solicitação
socket.on('nova-solicitacao', (solicitacao) => {
  console.log('🆕 Nova solicitação recebida:', solicitacao);
  
  // Exemplo: Mostrar notificação
  if (Notification.permission === 'granted') {
    new Notification('Nova Solicitação', {
      body: `${solicitacao.protocolo}: ${solicitacao.titulo}`,
      icon: '/icon.png'
    });
  }
  
  // Atualizar UI
  adicionarSolicitacaoNaLista(solicitacao);
});

// Escutar atualização de status
socket.on('atualizacao-status', (update) => {
  console.log('📝 Status atualizado:', update);
  
  // Exemplo: Atualizar status na lista
  atualizarStatusNaUI(update.solicitacaoId, update.status);
});

// Erro de conexão
socket.on('connect_error', (error) => {
  console.error('❌ Erro ao conectar WebSocket:', error);
});

// Desconexão
socket.on('disconnect', (reason) => {
  console.log('⚠️ WebSocket desconectado:', reason);
});
</script>
```

**Node.js (Cliente):**
```javascript
const io = require('socket.io-client');

const socket = io('http://localhost:3000', {
  transports: ['websocket', 'polling']
});

socket.on('connect', () => {
  console.log('WebSocket conectado!');
});

socket.on('nova-solicitacao', (data) => {
  console.log('Nova solicitação:', data);
});

socket.on('atualizacao-status', (data) => {
  console.log('Status atualizado:', data);
});
```

---

## 🎯 Resumo dos Endpoints

| Método | Endpoint | Auth | Descrição |
|--------|----------|------|-----------|
| POST | `/api/auth/register` | ❌ | Registrar usuário |
| POST | `/api/auth/login` | ❌ | Login |
| POST | `/api/solicitacoes` | ✅ | Criar solicitação |
| GET | `/api/solicitacoes/minhas` | ✅ | Listar minhas |
| GET | `/api/solicitacoes/:id` | ✅ | Detalhes |
| GET | `/api/solicitacoes/:id/historico` | ✅ | Histórico |
| POST | `/api/solicitacoes/:id/comentarios` | ✅ | Comentário |
| PATCH | `/api/solicitacoes/:id/resolver` | ✅ | Resolver |
| GET | `/api/solicitacoes/admin/novas` | 👑 | Novas (ADMIN) |
| PATCH | `/api/solicitacoes/:id/atribuir` | 👑 | Atribuir (ADMIN) |
| POST | `/api/solicitacoes/:id/primeira-resposta` | 👑 | Primeira resposta (ADMIN) |

**Legenda:**
- ❌ Não requer autenticação
- ✅ Requer token JWT
- 👑 Requer token JWT com perfil ADMIN

---

## 📝 Notas Importantes

1. **Token JWT expira em 24 horas** - Faça login novamente se receber erro 401
2. **CORS está configurado** para `http://localhost:4200` - Front-end Angular
3. **WebSocket conecta automaticamente** na mesma porta (3000)
4. **Upload de arquivos** deve usar `multipart/form-data`
5. **Primeira resposta atualiza TMR** - Campo `firstResponseAt` no banco

---

Mais documentação: **[SETUP-COMPLETO.md](./SETUP-COMPLETO.md)**
