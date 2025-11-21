# 🧪 Script de Teste - Autenticação Completa

## Teste Rápido no PowerShell

### 1️⃣ Registrar Usuário Admin

```powershell
$body = @{
    nome = "Admin Sistema"
    email = "admin@conectaies.com"
    senha = "senha123"
    tipoPerfil = "ADMIN"
    matricula = "ADM001"
} | ConvertTo-Json

$response = Invoke-RestMethod -Uri "http://localhost:3000/api/auth/register" `
    -Method POST `
    -ContentType "application/json" `
    -Body $body

Write-Host "✅ Usuário registrado com sucesso!" -ForegroundColor Green
Write-Host "Token: $($response.token)" -ForegroundColor Yellow
Write-Host "Usuário: $($response.usuario.nome) - $($response.usuario.tipoPerfil)" -ForegroundColor Cyan

# Salvar token
$global:token = $response.token
```

---

### 2️⃣ Fazer Login

```powershell
$loginBody = @{
    email = "admin@conectaies.com"
    senha = "senha123"
} | ConvertTo-Json

$loginResponse = Invoke-RestMethod -Uri "http://localhost:3000/api/auth/login" `
    -Method POST `
    -ContentType "application/json" `
    -Body $loginBody

Write-Host "✅ Login realizado com sucesso!" -ForegroundColor Green
Write-Host "Token: $($loginResponse.token)" -ForegroundColor Yellow

# Salvar token
$global:token = $loginResponse.token
```

---

### 3️⃣ Criar Solicitação (Autenticada)

```powershell
$headers = @{
    "Authorization" = "Bearer $global:token"
    "Content-Type" = "application/json"
}

$solicitacaoBody = @{
    titulo = "Necessito de apoio para locomoção"
    descricao = "Preciso de auxílio para me deslocar entre os blocos A e B"
    tipo = "APOIO_LOCOMOCAO"
} | ConvertTo-Json

$solicitacao = Invoke-RestMethod -Uri "http://localhost:3000/api/solicitacoes" `
    -Method POST `
    -Headers $headers `
    -Body $solicitacaoBody

Write-Host "✅ Solicitação criada com sucesso!" -ForegroundColor Green
Write-Host "Protocolo: $($solicitacao.protocolo)" -ForegroundColor Yellow
Write-Host "Status: $($solicitacao.status)" -ForegroundColor Cyan
```

---

### 4️⃣ Listar Minhas Solicitações

```powershell
$headers = @{
    "Authorization" = "Bearer $global:token"
}

$minhasSolicitacoes = Invoke-RestMethod -Uri "http://localhost:3000/api/solicitacoes/minhas" `
    -Method GET `
    -Headers $headers

Write-Host "✅ Solicitações recuperadas:" -ForegroundColor Green
$minhasSolicitacoes | ForEach-Object {
    Write-Host "  - [$($_.protocolo)] $($_.titulo) - Status: $($_.status)" -ForegroundColor Cyan
}
```

---

### 5️⃣ Listar Novas Solicitações (Admin)

```powershell
$headers = @{
    "Authorization" = "Bearer $global:token"
}

$novasSolicitacoes = Invoke-RestMethod -Uri "http://localhost:3000/api/solicitacoes/admin/novas" `
    -Method GET `
    -Headers $headers

Write-Host "✅ Novas solicitações (Admin):" -ForegroundColor Green
$novasSolicitacoes | ForEach-Object {
    Write-Host "  - [$($_.protocolo)] $($_.titulo) - Tempo restante TMR: $($_.timeToTmrBreach)s" -ForegroundColor Yellow
}
```

---

## 🔥 Script Completo - Copiar e Colar

```powershell
# =====================================================
# TESTE COMPLETO - ConectaIES Backend
# =====================================================

Write-Host "`n🚀 Iniciando testes do ConectaIES Backend...`n" -ForegroundColor Magenta

# 1. Registrar Admin
Write-Host "1️⃣ Registrando usuário Admin..." -ForegroundColor Blue
$registerBody = @{
    nome = "Admin Sistema"
    email = "admin@conectaies.com"
    senha = "senha123"
    tipoPerfil = "ADMIN"
    matricula = "ADM001"
} | ConvertTo-Json

try {
    $registerResponse = Invoke-RestMethod -Uri "http://localhost:3000/api/auth/register" `
        -Method POST `
        -ContentType "application/json" `
        -Body $registerBody
    
    Write-Host "   ✅ Usuário registrado: $($registerResponse.usuario.nome)" -ForegroundColor Green
    $global:token = $registerResponse.token
} catch {
    Write-Host "   ⚠️ Usuário já existe, fazendo login..." -ForegroundColor Yellow
    
    # Login se já existir
    $loginBody = @{
        email = "admin@conectaies.com"
        senha = "senha123"
    } | ConvertTo-Json
    
    $loginResponse = Invoke-RestMethod -Uri "http://localhost:3000/api/auth/login" `
        -Method POST `
        -ContentType "application/json" `
        -Body $loginBody
    
    Write-Host "   ✅ Login realizado: $($loginResponse.usuario.nome)" -ForegroundColor Green
    $global:token = $loginResponse.token
}

# 2. Criar Solicitação
Write-Host "`n2️⃣ Criando solicitação..." -ForegroundColor Blue
$headers = @{
    "Authorization" = "Bearer $global:token"
    "Content-Type" = "application/json"
}

$solicitacaoBody = @{
    titulo = "Teste de solicitação via API"
    descricao = "Esta é uma solicitação de teste criada automaticamente"
    tipo = "APOIO_LOCOMOCAO"
} | ConvertTo-Json

$solicitacao = Invoke-RestMethod -Uri "http://localhost:3000/api/solicitacoes" `
    -Method POST `
    -Headers $headers `
    -Body $solicitacaoBody

Write-Host "   ✅ Solicitação criada: $($solicitacao.protocolo)" -ForegroundColor Green
Write-Host "   📝 Título: $($solicitacao.titulo)" -ForegroundColor Cyan
Write-Host "   🔖 Status: $($solicitacao.status)" -ForegroundColor Cyan

# 3. Listar Minhas Solicitações
Write-Host "`n3️⃣ Listando minhas solicitações..." -ForegroundColor Blue
$headers = @{ "Authorization" = "Bearer $global:token" }

$minhas = Invoke-RestMethod -Uri "http://localhost:3000/api/solicitacoes/minhas" `
    -Method GET `
    -Headers $headers

Write-Host "   ✅ Total: $($minhas.Count) solicitação(ões)" -ForegroundColor Green
$minhas | ForEach-Object {
    Write-Host "      - [$($_.protocolo)] $($_.titulo)" -ForegroundColor Cyan
}

# 4. Listar Novas (Admin)
Write-Host "`n4️⃣ Listando novas solicitações (Admin)..." -ForegroundColor Blue
$novas = Invoke-RestMethod -Uri "http://localhost:3000/api/solicitacoes/admin/novas" `
    -Method GET `
    -Headers $headers

Write-Host "   ✅ Novas solicitações: $($novas.Count)" -ForegroundColor Green
$novas | ForEach-Object {
    Write-Host "      - [$($_.protocolo)] TMR: $($_.timeToTmrBreach)s restantes" -ForegroundColor Yellow
}

Write-Host "`n🎉 Todos os testes concluídos com sucesso!`n" -ForegroundColor Magenta
Write-Host "Token salvo em `$global:token" -ForegroundColor Gray
```

---

## 📊 Validação de Compatibilidade Frontend

### Verificar Estrutura da Resposta

```powershell
# Verificar se a resposta está no formato correto
$response = Invoke-RestMethod -Uri "http://localhost:3000/api/auth/login" `
    -Method POST `
    -ContentType "application/json" `
    -Body '{"email":"admin@conectaies.com","senha":"senha123"}'

# Validar estrutura
if ($response.token -and $response.usuario) {
    Write-Host "✅ Formato compatível com frontend Angular!" -ForegroundColor Green
    Write-Host "   - Campo 'token' presente: ✓" -ForegroundColor Cyan
    Write-Host "   - Campo 'usuario' presente: ✓" -ForegroundColor Cyan
    Write-Host "   - TipoPerfil: $($response.usuario.tipoPerfil) ✓" -ForegroundColor Cyan
} else {
    Write-Host "❌ Formato incompatível!" -ForegroundColor Red
}
```

---

## 🔧 Troubleshooting

### Erro 401 (Unauthorized)
```powershell
# Token pode estar expirado ou inválido
# Faça login novamente
```

### Erro 409 (Conflict)
```powershell
# Email já cadastrado
# Use outro email ou faça login
```

### Erro 403 (Forbidden)
```powershell
# Você não tem permissão (ex: não é ADMIN)
# Verifique o tipoPerfil do usuário
```

---

## ✅ Checklist de Testes

- [ ] Register retorna `token` e `usuario`
- [ ] Login retorna `token` e `usuario`
- [ ] Token é aceito no header `Authorization: Bearer`
- [ ] Criar solicitação funciona com autenticação
- [ ] Listar solicitações funciona
- [ ] Admin consegue acessar `/admin/novas`
- [ ] WebSocket está rodando na porta 3000

**Status:** Pronto para integração com frontend Angular! 🚀
