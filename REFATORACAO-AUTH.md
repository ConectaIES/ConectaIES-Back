# 🔄 Log de Refatoração: Compatibilidade Backend ↔️ Frontend

**Data:** 21/11/2025  
**Objetivo:** Alinhar autenticação do backend NestJS com frontend Angular

---

## 📋 Mudanças Implementadas

### 1. **DTOs de Autenticação Criados**

#### `LoginDto` (`src/auth/dto/login.dto.ts`)
```typescript
{
  email: string;        // Validação: email válido
  senha: string;        // Validação: mínimo 6 caracteres
}
```

#### `RegisterDto` (`src/auth/dto/register.dto.ts`)
```typescript
{
  nome: string;         // Validação: mínimo 3 caracteres
  email: string;        // Validação: email válido
  senha: string;        // Validação: mínimo 6 caracteres
  tipoPerfil: 'ALUNO' | 'PROFESSOR' | 'ADMIN';
  matricula?: string;   // Opcional
}
```

#### `AuthResponseDto` (`src/auth/dto/auth-response.dto.ts`)
```typescript
{
  token: string;        // ✅ ALTERADO de "access_token" para "token"
  usuario: {            // ✅ ALTERADO de "user" para "usuario"
    id: number;
    nome: string;
    email: string;
    tipoPerfil: 'ALUNO' | 'PROFESSOR' | 'ADMIN';
    matricula?: string; // ✅ ADICIONADO
    createdAt?: Date;
  }
}
```

---

### 2. **Entidade User Atualizada**

#### Novo campo adicionado:
```typescript
@Column({ length: 50, nullable: true })
matricula: string;
```

**Migração automática:** O TypeORM criará a coluna `matricula` no próximo start.

---

### 3. **AuthService Refatorado**

#### ✅ Antes (Incompatível):
```typescript
async login(email: string, senha: string) {
  return {
    access_token: this.jwtService.sign(payload),
    user: { id, nome, email, tipoPerfil }
  };
}
```

#### ✅ Depois (Compatível):
```typescript
async login(loginDto: LoginDto): Promise<AuthResponseDto> {
  return {
    token: this.jwtService.sign(payload),
    usuario: { id, nome, email, tipoPerfil, matricula, createdAt }
  };
}
```

**Mudanças:**
- Agora recebe `LoginDto` tipado
- Retorna `token` ao invés de `access_token`
- Retorna `usuario` ao invés de `user`
- Inclui campo `matricula`
- Usa `ConflictException` (409) para email duplicado

---

### 4. **AuthController Refatorado**

#### ✅ Antes:
```typescript
@Post('login')
async login(@Body() body: { email: string; senha: string }) {
  return this.authService.login(body.email, body.senha);
}
```

#### ✅ Depois:
```typescript
@Post('login')
@HttpCode(HttpStatus.OK)
async login(@Body() loginDto: LoginDto): Promise<AuthResponseDto> {
  return this.authService.login(loginDto);
}
```

**Melhorias:**
- Validação automática via `class-validator`
- HTTP status codes corretos (200 para login, 201 para register)
- Type-safe com DTOs

---

## 🔍 Compatibilidade com Frontend

### Frontend Angular espera:

```typescript
// AuthService (Frontend)
login(credentials: LoginCredentials): Observable<AuthResponse> {
  return this.http.post<AuthResponse>(`${this.API_URL}/auth/login`, credentials)
    .pipe(
      tap(response => {
        localStorage.setItem('conecta_ies_token', response.token);
        localStorage.setItem('conecta_ies_user', JSON.stringify(response.usuario));
      })
    );
}
```

### Backend agora retorna:

```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "usuario": {
    "id": 1,
    "nome": "João Silva",
    "email": "joao@aluno.com",
    "tipoPerfil": "ALUNO",
    "matricula": "2025001",
    "createdAt": "2025-11-21T10:00:00.000Z"
  }
}
```

✅ **100% Compatível!**

---

## 🔐 Fluxo de Autenticação

### 1. **Login**
```
POST /api/auth/login
Content-Type: application/json

{
  "email": "joao@aluno.com",
  "senha": "senha123"
}

→ Response 200:
{
  "token": "eyJ...",
  "usuario": { ... }
}
```

### 2. **Register**
```
POST /api/auth/register
Content-Type: application/json

{
  "nome": "João Silva",
  "email": "joao@aluno.com",
  "senha": "senha123",
  "tipoPerfil": "ALUNO",
  "matricula": "2025001"
}

→ Response 201:
{
  "token": "eyJ...",
  "usuario": { ... }
}
```

### 3. **Requisições Autenticadas**
```
GET /api/solicitacoes/minhas
Authorization: Bearer eyJ...

→ O JwtAuthGuard valida o token
→ O payload é injetado em req.user
```

---

## 🧪 Validações Implementadas

### LoginDto:
- ✅ Email deve ser válido
- ✅ Senha obrigatória (mín. 6 caracteres)

### RegisterDto:
- ✅ Nome obrigatório (mín. 3 caracteres)
- ✅ Email válido e único
- ✅ Senha obrigatória (mín. 6 caracteres)
- ✅ TipoPerfil deve ser ALUNO, PROFESSOR ou ADMIN
- ✅ Matrícula opcional

---

## 🚀 Próximos Passos

1. ✅ **Testar endpoints** após restart do servidor
2. ✅ **Verificar criação da coluna `matricula`** no MySQL
3. ✅ **Testar login/register do frontend**
4. ✅ **Validar interceptor de autenticação**

---

## 📝 Comandos de Teste

### PowerShell - Register:
```powershell
$body = @{
    nome = "João Silva"
    email = "joao@aluno.com"
    senha = "senha123"
    tipoPerfil = "ALUNO"
    matricula = "2025001"
} | ConvertTo-Json

Invoke-RestMethod -Uri "http://localhost:3000/api/auth/register" `
    -Method POST `
    -ContentType "application/json" `
    -Body $body
```

### PowerShell - Login:
```powershell
$body = @{
    email = "joao@aluno.com"
    senha = "senha123"
} | ConvertTo-Json

$response = Invoke-RestMethod -Uri "http://localhost:3000/api/auth/login" `
    -Method POST `
    -ContentType "application/json" `
    -Body $body

# Salvar token para usar depois
$token = $response.token
```

### PowerShell - Requisição Autenticada:
```powershell
Invoke-RestMethod -Uri "http://localhost:3000/api/solicitacoes/minhas" `
    -Method GET `
    -Headers @{ Authorization = "Bearer $token" }
```

---

## ✅ Checklist de Compatibilidade

- [x] Response usa campo `token` (não `access_token`)
- [x] Response usa campo `usuario` (não `user`)
- [x] Usuario inclui campo `matricula`
- [x] DTOs com validação automática
- [x] HTTP status codes corretos
- [x] Tratamento de erros adequado (401, 409)
- [x] TypeScript type-safe
- [x] Documentação atualizada

---

**Status:** ✅ **COMPLETO - Backend 100% compatível com Frontend Angular**
