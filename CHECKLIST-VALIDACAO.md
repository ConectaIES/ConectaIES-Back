# ✅ Checklist de Validação - ConectaIES

Use este checklist para validar se tudo está funcionando corretamente.

---

## 🔧 1. Configuração do Ambiente

### MySQL
- [ ] MySQL instalado e rodando
- [ ] Banco `conecta_ies` criado
- [ ] Consegue conectar via `mysql -u root -p`
- [ ] Porta 3306 acessível

**Como validar:**
```bash
mysql -u root -p
SHOW DATABASES;
USE conecta_ies;
```

---

### Back-end
- [ ] Dependências instaladas (`npm install`)
- [ ] Arquivo `.env` configurado corretamente
- [ ] Servidor inicia sem erros (`npm run start:dev`)
- [ ] Mensagem de sucesso aparece no console
- [ ] Tabelas criadas automaticamente pelo TypeORM

**Como validar:**
```bash
npm run start:dev

# Deve mostrar:
# [Nest] Nest application successfully started
# 🚀 Servidor rodando em http://localhost:3000
```

**Validar tabelas:**
```sql
USE conecta_ies;
SHOW TABLES;

# Deve mostrar:
# - users
# - solicitations
# - attachments
# - event_history
```

---

### Front-end (se aplicável)
- [ ] Dependências instaladas
- [ ] URL da API configurada (`http://localhost:3000/api`)
- [ ] URL do WebSocket configurada (`ws://localhost:3000`)
- [ ] Servidor rodando (`ng serve`)
- [ ] Acessível em `http://localhost:4200`

---

## 🔐 2. Autenticação

### Registrar Usuário
- [ ] Endpoint `/api/auth/register` responde
- [ ] Retorna objeto com `user` e `access_token`
- [ ] Usuário salvo no banco de dados
- [ ] Senha armazenada como hash (não texto plano)

**Teste:**
```powershell
Invoke-RestMethod -Uri "http://localhost:3000/api/auth/register" `
  -Method POST `
  -ContentType "application/json" `
  -Body '{"nome":"Teste","email":"teste@test.com","senha":"senha123","tipoPerfil":"ALUNO"}'
```

**Validar no banco:**
```sql
SELECT id, nome, email, tipo_perfil FROM users WHERE email = 'teste@test.com';
```

---

### Login
- [ ] Endpoint `/api/auth/login` responde
- [ ] Retorna `access_token` válido
- [ ] Token pode ser decodificado (JWT)
- [ ] Login com senha errada retorna erro 401

**Teste:**
```powershell
Invoke-RestMethod -Uri "http://localhost:3000/api/auth/login" `
  -Method POST `
  -ContentType "application/json" `
  -Body '{"email":"teste@test.com","senha":"senha123"}'
```

---

### Autenticação JWT
- [ ] Requisições sem token retornam erro 401
- [ ] Requisições com token inválido retornam erro 401
- [ ] Requisições com token válido funcionam
- [ ] Token expira em 24 horas (configurável)

**Teste (deve dar erro 401):**
```powershell
Invoke-RestMethod -Uri "http://localhost:3000/api/solicitacoes/minhas" -Method GET
```

**Teste (deve funcionar):**
```powershell
$token = "SEU_TOKEN_AQUI"
Invoke-RestMethod -Uri "http://localhost:3000/api/solicitacoes/minhas" `
  -Method GET `
  -Headers @{"Authorization" = "Bearer $token"}
```

---

## 📝 3. Solicitações - CRUD Básico

### Criar Solicitação
- [ ] Endpoint `/api/solicitacoes` (POST) funciona
- [ ] Protocolo gerado automaticamente (formato: SOL-YYYY-NNNN)
- [ ] Status inicial é `ABERTO`
- [ ] Registro salvo no banco
- [ ] Evento criado no histórico (`STATUS_CHANGE`)
- [ ] WebSocket emite evento `nova-solicitacao`
- [ ] `timeToTmrBreach` calculado corretamente (14400 segundos = 4 horas)

**Teste:**
```powershell
$token = "SEU_TOKEN_AQUI"
Invoke-RestMethod -Uri "http://localhost:3000/api/solicitacoes" `
  -Method POST `
  -Headers @{"Authorization" = "Bearer $token"; "Content-Type" = "application/json"} `
  -Body '{"titulo":"Teste","descricao":"Desc","tipo":"APOIO_LOCOMOCAO"}'
```

**Validar no banco:**
```sql
SELECT * FROM solicitations ORDER BY id DESC LIMIT 1;
SELECT * FROM event_history WHERE solicitacao_id = 1;
```

---

### Listar Solicitações
- [ ] Endpoint `/api/solicitacoes/minhas` funciona
- [ ] Retorna apenas solicitações do usuário logado
- [ ] Ordenado por mais recentes primeiro
- [ ] `timeToTmrBreach` calculado dinamicamente
- [ ] Campo `usuarioNome` preenchido

**Teste:**
```powershell
Invoke-RestMethod -Uri "http://localhost:3000/api/solicitacoes/minhas" `
  -Method GET `
  -Headers @{"Authorization" = "Bearer $token"}
```

---

### Obter Detalhes
- [ ] Endpoint `/api/solicitacoes/:id` funciona
- [ ] Retorna dados completos da solicitação
- [ ] Inclui anexos (se houver)
- [ ] Inclui dados do usuário

**Teste:**
```powershell
Invoke-RestMethod -Uri "http://localhost:3000/api/solicitacoes/1" `
  -Method GET `
  -Headers @{"Authorization" = "Bearer $token"}
```

---

### Histórico
- [ ] Endpoint `/api/solicitacoes/:id/historico` funciona
- [ ] Retorna eventos em ordem cronológica
- [ ] Inclui nome do usuário que criou cada evento
- [ ] Tipos de evento corretos (STATUS_CHANGE, COMMENT, ATTACHMENT)

**Teste:**
```powershell
Invoke-RestMethod -Uri "http://localhost:3000/api/solicitacoes/1/historico" `
  -Method GET `
  -Headers @{"Authorization" = "Bearer $token"}
```

---

### Adicionar Comentário
- [ ] Endpoint `/api/solicitacoes/:id/comentarios` funciona
- [ ] Evento criado com tipo `COMMENT`
- [ ] WebSocket emite `atualizacao-status`
- [ ] Comentário visível no histórico

**Teste:**
```powershell
Invoke-RestMethod -Uri "http://localhost:3000/api/solicitacoes/1/comentarios" `
  -Method POST `
  -Headers @{"Authorization" = "Bearer $token"; "Content-Type" = "application/json"} `
  -Body '{"comentario":"Teste de comentário"}'
```

---

### Marcar como Resolvida
- [ ] Endpoint `/api/solicitacoes/:id/resolver` funciona
- [ ] Status atualizado para `RESOLVIDO`
- [ ] Evento criado no histórico
- [ ] WebSocket emite `atualizacao-status`

**Teste:**
```powershell
Invoke-RestMethod -Uri "http://localhost:3000/api/solicitacoes/1/resolver" `
  -Method PATCH `
  -Headers @{"Authorization" = "Bearer $token"}
```

---

## 👑 4. Funcionalidades Admin

### Listar Novas
- [ ] Endpoint `/api/solicitacoes/admin/novas` funciona
- [ ] Usuário não-admin recebe erro 403
- [ ] Admin consegue acessar
- [ ] Lista solicitações abertas/em análise/em execução
- [ ] `timeToTmrBreach` ordenado (mais urgentes primeiro)

**Teste com usuário comum (deve dar erro 403):**
```powershell
# Use token de usuário ALUNO
Invoke-RestMethod -Uri "http://localhost:3000/api/solicitacoes/admin/novas" `
  -Method GET `
  -Headers @{"Authorization" = "Bearer $tokenAluno"}
```

**Teste com admin (deve funcionar):**
```powershell
Invoke-RestMethod -Uri "http://localhost:3000/api/solicitacoes/admin/novas" `
  -Method GET `
  -Headers @{"Authorization" = "Bearer $tokenAdmin"}
```

---

### Atribuir Solicitação
- [ ] Endpoint `/api/solicitacoes/:id/atribuir` funciona
- [ ] Requer perfil ADMIN
- [ ] Status muda para `EM_ANALISE`
- [ ] Evento criado com a nota
- [ ] WebSocket emite `atualizacao-status`

**Teste:**
```powershell
Invoke-RestMethod -Uri "http://localhost:3000/api/solicitacoes/1/atribuir" `
  -Method PATCH `
  -Headers @{"Authorization" = "Bearer $tokenAdmin"; "Content-Type" = "application/json"} `
  -Body '{"usuarioId":2,"nota":"Atribuído para análise"}'
```

---

### Primeira Resposta (⚠️ CRÍTICO para TMR)
- [ ] Endpoint `/api/solicitacoes/:id/primeira-resposta` funciona
- [ ] Requer perfil ADMIN
- [ ] Status muda para `EM_EXECUCAO`
- [ ] **Campo `firstResponseAt` atualizado com timestamp atual**
- [ ] **`timeToTmrBreach` passa a ser `null`**
- [ ] Evento criado com a resposta
- [ ] WebSocket emite `atualizacao-status`

**Teste:**
```powershell
Invoke-RestMethod -Uri "http://localhost:3000/api/solicitacoes/1/primeira-resposta" `
  -Method POST `
  -Headers @{"Authorization" = "Bearer $tokenAdmin"; "Content-Type" = "application/json"} `
  -Body '{"resposta":"Olá! Já estamos providenciando."}'
```

**VALIDAÇÃO CRÍTICA no banco:**
```sql
SELECT 
  id, 
  protocolo, 
  status,
  created_at,
  first_response_at,
  TIMESTAMPDIFF(MINUTE, created_at, first_response_at) as tmr_minutos
FROM solicitations 
WHERE id = 1;
```

Deve mostrar:
- `status`: `EM_EXECUCAO`
- `first_response_at`: Timestamp atual (não NULL)
- `tmr_minutos`: Tempo em minutos entre criação e primeira resposta

---

## 📎 5. Upload de Arquivos

### Upload Básico
- [ ] Endpoint aceita `multipart/form-data`
- [ ] Aceita até 3 arquivos
- [ ] Arquivos salvos em `/uploads`
- [ ] Registros criados na tabela `attachments`
- [ ] URLs retornadas corretamente
- [ ] Arquivos acessíveis via `http://localhost:3000/uploads/nome-arquivo`

**Teste:**
```bash
# Usando cURL
curl -X POST http://localhost:3000/api/solicitacoes \
  -H "Authorization: Bearer $TOKEN" \
  -F "titulo=Teste com arquivo" \
  -F "descricao=Desc" \
  -F "tipo=OUTROS" \
  -F "anexos=@C:/caminho/arquivo.pdf"
```

---

### Validações de Upload
- [ ] Rejeita mais de 3 arquivos (erro 400)
- [ ] Rejeita arquivos maiores que 5MB (erro 400)
- [ ] Rejeita tipos não permitidos (erro 400)
- [ ] Aceita: jpg, png, pdf, doc, docx

**Teste (deve dar erro):**
```bash
# Tentar enviar 4 arquivos
curl -X POST http://localhost:3000/api/solicitacoes \
  -H "Authorization: Bearer $TOKEN" \
  -F "titulo=Teste" \
  -F "descricao=Desc" \
  -F "tipo=OUTROS" \
  -F "anexos=@arquivo1.pdf" \
  -F "anexos=@arquivo2.pdf" \
  -F "anexos=@arquivo3.pdf" \
  -F "anexos=@arquivo4.pdf"  # Deve falhar
```

---

## 🔌 6. WebSocket

### Conexão
- [ ] WebSocket aceita conexões em `ws://localhost:3000`
- [ ] CORS configurado para `http://localhost:4200`
- [ ] Conexão estabelecida com sucesso
- [ ] Console mostra "Cliente conectado: [socket-id]"

**Teste (JavaScript no navegador):**
```javascript
const socket = io('http://localhost:3000');
socket.on('connect', () => console.log('Conectado!', socket.id));
```

---

### Evento: nova-solicitacao
- [ ] Emitido ao criar solicitação
- [ ] Payload contém dados completos da solicitação
- [ ] Todos os clientes conectados recebem
- [ ] `timeToTmrBreach` presente no payload

**Teste:**
1. Conectar WebSocket no navegador
2. Criar solicitação via API
3. Verificar console do navegador

---

### Evento: atualizacao-status
- [ ] Emitido ao mudar status
- [ ] Payload contém `solicitacaoId`, `status`, `timestamp`
- [ ] Emitido em: comentário, resolver, atribuir, primeira resposta

**Teste:**
1. Conectar WebSocket
2. Adicionar comentário via API
3. Verificar evento recebido

---

## 🔄 7. Regras de Negócio

### Geração de Protocolo
- [ ] Formato correto: `SOL-YYYY-NNNN`
- [ ] Sequencial por ano
- [ ] Único (não duplica)

**Validar:**
```sql
SELECT protocolo FROM solicitations ORDER BY id;
```

Deve mostrar:
- `SOL-2025-0001`
- `SOL-2025-0002`
- `SOL-2025-0003`
- ...

---

### Cálculo de TMR
- [ ] `timeToTmrBreach` inicia em 14400 segundos (4 horas)
- [ ] Decresce conforme tempo passa
- [ ] Passa a ser `null` após primeira resposta
- [ ] Nunca negativo (mínimo 0)

**Teste:**
```javascript
// Criar solicitação
const response = await fetch('http://localhost:3000/api/solicitacoes', {/*...*/});
const solicitacao = await response.json();

console.log('TMR inicial:', solicitacao.timeToTmrBreach); // ~14400

// Aguardar 1 minuto e consultar novamente
setTimeout(async () => {
  const response2 = await fetch(`http://localhost:3000/api/solicitacoes/${solicitacao.id}`, {/*...*/});
  const atualizada = await response2.json();
  
  console.log('TMR após 1 min:', atualizada.timeToTmrBreach); // ~14340
}, 60000);
```

---

### Fluxo de Status
- [ ] Criação: `ABERTO`
- [ ] Visualização admin: pode mudar para `NAO_VISTO` → `EM_ANALISE`
- [ ] Primeira resposta: `EM_EXECUCAO`
- [ ] Usuário pode: `RESOLVIDO`

**Validar:**
```sql
SELECT id, protocolo, status, first_response_at FROM solicitations ORDER BY id;
```

---

## 🌐 8. Integração Front-end ↔ Back-end

### CORS
- [ ] Front-end consegue fazer requisições
- [ ] Sem erros de CORS no console
- [ ] Preflight requests (OPTIONS) funcionam
- [ ] Credenciais (cookies) permitidas

**Validar no console do navegador (F12):**
Não deve aparecer:
```
Access to fetch at 'http://localhost:3000/api/...' from origin 'http://localhost:4200' 
has been blocked by CORS policy
```

---

### Autenticação
- [ ] Front-end consegue fazer login
- [ ] Token armazenado (localStorage/sessionStorage)
- [ ] Token enviado em requisições subsequentes
- [ ] Refresh automático de token (se implementado)

---

### Comunicação em Tempo Real
- [ ] Front-end conecta ao WebSocket
- [ ] Dashboard admin atualiza ao criar solicitação
- [ ] Notificações aparecem em tempo real
- [ ] Status muda automaticamente na tela

---

## 🐛 9. Tratamento de Erros

### Erros Esperados
- [ ] 400 - Dados inválidos (validação)
- [ ] 401 - Não autenticado
- [ ] 403 - Sem permissão (não é admin)
- [ ] 404 - Recurso não encontrado
- [ ] 500 - Erro interno (log no console)

**Teste 401:**
```powershell
# Sem token
Invoke-RestMethod -Uri "http://localhost:3000/api/solicitacoes/minhas" -Method GET
```

**Teste 403:**
```powershell
# Aluno tentando acessar rota admin
Invoke-RestMethod -Uri "http://localhost:3000/api/solicitacoes/admin/novas" `
  -Method GET `
  -Headers @{"Authorization" = "Bearer $tokenAluno"}
```

**Teste 404:**
```powershell
Invoke-RestMethod -Uri "http://localhost:3000/api/solicitacoes/99999" `
  -Method GET `
  -Headers @{"Authorization" = "Bearer $token"}
```

---

## 📊 10. Performance e Segurança

### Performance
- [ ] Consultas ao banco otimizadas (sem N+1)
- [ ] Índices nas colunas mais consultadas
- [ ] Tempo de resposta < 500ms em operações normais
- [ ] WebSocket não trava em múltiplas conexões

**Validar:**
```sql
EXPLAIN SELECT * FROM solicitations WHERE status = 'ABERTO';
```

---

### Segurança
- [ ] Senhas NUNCA armazenadas em texto plano (hash bcrypt)
- [ ] JWT Secret configurado (não usar padrão em produção)
- [ ] SQL Injection protegido (TypeORM faz automaticamente)
- [ ] Uploads validados (tipo e tamanho)
- [ ] Rate limiting (opcional, para produção)

**Validar senhas:**
```sql
SELECT senha_hash FROM users LIMIT 1;
```

Deve mostrar hash bcrypt (começa com `$2b$`), NÃO texto plano.

---

## 📋 Checklist Final

Antes de considerar **100% funcional**:

### Infraestrutura
- [ ] MySQL rodando
- [ ] Back-end rodando sem erros
- [ ] Front-end rodando (se aplicável)
- [ ] Todas as tabelas criadas
- [ ] Arquivo `.env` configurado

### Funcionalidades Básicas
- [ ] Registrar usuário
- [ ] Login
- [ ] Criar solicitação
- [ ] Listar solicitações
- [ ] Ver detalhes
- [ ] Ver histórico

### Funcionalidades Admin
- [ ] Listar novas solicitações
- [ ] Atribuir solicitação
- [ ] Enviar primeira resposta
- [ ] TMR calculado corretamente

### Upload e WebSocket
- [ ] Upload de arquivos funciona
- [ ] WebSocket conecta
- [ ] Eventos em tempo real funcionam

### Integração
- [ ] Front-end conecta ao back-end
- [ ] Sem erros de CORS
- [ ] Autenticação funciona end-to-end
- [ ] Tempo real funciona end-to-end

---

## 🎯 Teste Completo End-to-End

Execute este fluxo completo para validar tudo:

1. **Registrar usuário ADMIN**
2. **Registrar usuário ALUNO**
3. **Login como ALUNO**
4. **Criar solicitação (anotar ID e tempo)**
5. **Adicionar comentário**
6. **Login como ADMIN**
7. **Ver novas solicitações (validar TMR)**
8. **Atribuir solicitação**
9. **Enviar primeira resposta (validar TMR zerou)**
10. **Login como ALUNO novamente**
11. **Ver detalhes (validar histórico completo)**
12. **Marcar como resolvida**
13. **Validar no banco todos os dados**

---

Se TODOS os itens estão marcados ✅, sua aplicação está **100% funcional e pronta para uso!** 🎉
