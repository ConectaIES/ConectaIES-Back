# 🔄 Integração Backend ↔️ Frontend - ConectaIES

## ✅ Status: 100% Compatível

**Data da Refatoração:** 21/11/2025

---

## 🎯 Resumo das Mudanças

O backend foi **completamente refatorado** para garantir compatibilidade total com o frontend Angular. Todas as estruturas de dados, endpoints e validações agora estão alinhadas.

---

## 📡 Contrato de API - Autenticação

### POST `/api/auth/register`

**Request:**
```json
{
  "nome": "João Silva",
  "email": "joao@aluno.com",
  "senha": "senha123",
  "tipoPerfil": "ALUNO",
  "matricula": "2025001"
}
```

**Response (201 Created):**
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

### POST `/api/auth/login`

**Request:**
```json
{
  "email": "joao@aluno.com",
  "senha": "senha123"
}
```

**Response (200 OK):**
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

---

## 🔐 Fluxo de Autenticação

### Frontend (Angular)

1. **Login/Register:**
```typescript
// AuthService
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

2. **AuthInterceptor adiciona token automaticamente:**
```typescript
if (token) {
  const clonedRequest = req.clone({
    setHeaders: {
      Authorization: `Bearer ${token}`
    }
  });
  return next(clonedRequest);
}
```

3. **AuthGuard protege rotas:**
```typescript
if (authService.isAuthenticated()) {
  return true;
}
router.navigate(['/auth/inicial']);
return false;
```

### Backend (NestJS)

1. **AuthController recebe requisição:**
```typescript
@Post('login')
@HttpCode(HttpStatus.OK)
async login(@Body() loginDto: LoginDto): Promise<AuthResponseDto> {
  return this.authService.login(loginDto);
}
```

2. **AuthService valida e gera token:**
```typescript
const payload = { email: user.email, sub: user.id, tipoPerfil: user.tipoPerfil };
return {
  token: this.jwtService.sign(payload),
  usuario: { id, nome, email, tipoPerfil, matricula }
};
```

3. **JwtStrategy valida token em requisições protegidas:**
```typescript
async validate(payload: any) {
  const user = await this.userRepository.findOne({ where: { id: payload.sub } });
  return { id: user.id, nome: user.nome, email: user.email, tipoPerfil: user.tipoPerfil };
}
```

4. **JwtAuthGuard protege endpoints:**
```typescript
@Controller('solicitacoes')
@UseGuards(JwtAuthGuard)
export class SolicitacoesController { ... }
```

---

## 🗄️ Modelo de Dados

### Usuario (Frontend)
```typescript
interface Usuario {
  id: number;
  nome: string;
  email: string;
  tipoPerfil: 'ALUNO' | 'PROFESSOR' | 'ADMIN';
  matricula?: string;
  createdAt?: Date;
}
```

### User (Backend - Entity)
```typescript
@Entity('users')
export class User {
  id: number;
  nome: string;
  email: string;
  senhaHash: string;
  tipoPerfil: TipoPerfil;
  matricula: string;
  createdAt: Date;
  updatedAt: Date;
}
```

✅ **Compatibilidade:** Frontend recebe `usuario` sem `senhaHash` e `updatedAt`

---

## 🔍 Validações Implementadas

### RegisterDto (Backend)
- ✅ Nome: mínimo 3 caracteres
- ✅ Email: formato válido e único no banco
- ✅ Senha: mínimo 6 caracteres
- ✅ TipoPerfil: ALUNO | PROFESSOR | ADMIN
- ✅ Matrícula: opcional

### LoginDto (Backend)
- ✅ Email: formato válido
- ✅ Senha: mínimo 6 caracteres

### CadastroComponent (Frontend)
- ✅ Nome: mínimo 3 caracteres
- ✅ Email: formato válido
- ✅ Senha: mínimo 6 caracteres
- ✅ Confirmar senha: deve ser igual à senha
- ✅ TipoPerfil: obrigatório (ALUNO ou PROFESSOR)

---

## 🚨 Tratamento de Erros

### Backend
| Código | Exceção | Mensagem |
|--------|---------|----------|
| 400 | BadRequestException | Dados de validação inválidos |
| 401 | UnauthorizedException | Credenciais inválidas |
| 409 | ConflictException | E-mail já cadastrado |

### Frontend (ErrorInterceptor)
```typescript
switch (error.status) {
  case 401:
    errorMessage = 'Sessão expirada. Faça login novamente.';
    authService.logout();
    break;
  case 403:
    errorMessage = 'Você não tem permissão para acessar este recurso.';
    break;
  case 409:
    errorMessage = 'E-mail já cadastrado.';
    break;
}
```

---

## 🧪 Testes de Compatibilidade

### ✅ Checklist
- [x] Campo `token` (não `access_token`)
- [x] Campo `usuario` (não `user`)
- [x] Campo `matricula` presente
- [x] HTTP status codes corretos (200, 201, 401, 409)
- [x] Validação automática com class-validator
- [x] JWT com header `Authorization: Bearer`
- [x] Frontend salva token em localStorage
- [x] AuthInterceptor adiciona token automaticamente
- [x] AuthGuard protege rotas
- [x] JwtAuthGuard protege endpoints
- [x] Logout limpa localStorage e redireciona

---

## 📂 Arquivos Modificados

### Backend
- ✅ `src/auth/dto/login.dto.ts` (criado)
- ✅ `src/auth/dto/register.dto.ts` (criado)
- ✅ `src/auth/dto/auth-response.dto.ts` (criado)
- ✅ `src/auth/auth.service.ts` (refatorado)
- ✅ `src/auth/auth.controller.ts` (refatorado)
- ✅ `src/database/entities/user.entity.ts` (campo `matricula` adicionado)

### Documentação
- ✅ `REFATORACAO-AUTH.md` (criado)
- ✅ `TESTES-AUTH.md` (criado)
- ✅ `COMPATIBILIDADE-FRONTEND.md` (este arquivo)
- ✅ `exemplos-requisicoes.md` (atualizado)

---

## 🚀 Como Testar

### 1. Iniciar Backend
```bash
npm run start:dev
```

### 2. Iniciar Frontend
```bash
cd ConectaIES-Front/conecta-ies-front
ng serve
```

### 3. Testar Fluxo Completo
1. Acesse `http://localhost:4200`
2. Clique em "Cadastrar"
3. Preencha os dados (Nome, Email, Senha, Tipo de Perfil)
4. Clique em "Cadastrar"
5. ✅ Deve redirecionar para `/home` automaticamente
6. ✅ Token deve estar salvo em localStorage
7. ✅ Navegue para outras páginas protegidas
8. ✅ Faça logout e teste login novamente

---

## 📊 Arquitetura de Autenticação

```
┌─────────────────────────────────────────────────────────┐
│                    FRONTEND (Angular)                    │
├─────────────────────────────────────────────────────────┤
│  LoginComponent/CadastroComponent                       │
│           ↓                                              │
│  AuthService.login(credentials)                          │
│           ↓                                              │
│  HttpClient.post('/api/auth/login', credentials)        │
│           ↓                                              │
│  AuthInterceptor (adiciona Bearer token)                │
│           ↓                                              │
│  ErrorInterceptor (trata erros)                         │
└─────────────────────────────────────────────────────────┘
                        ↓ HTTP Request
┌─────────────────────────────────────────────────────────┐
│                    BACKEND (NestJS)                      │
├─────────────────────────────────────────────────────────┤
│  AuthController.login(loginDto)                         │
│           ↓                                              │
│  AuthService.login(loginDto)                            │
│           ↓                                              │
│  UserRepository.findOne(email)                          │
│           ↓                                              │
│  bcrypt.compare(senha, senhaHash)                       │
│           ↓                                              │
│  JwtService.sign(payload)                               │
│           ↓                                              │
│  return { token, usuario }                              │
└─────────────────────────────────────────────────────────┘
                        ↓ HTTP Response
┌─────────────────────────────────────────────────────────┐
│                    FRONTEND (Angular)                    │
├─────────────────────────────────────────────────────────┤
│  AuthService recebe { token, usuario }                  │
│           ↓                                              │
│  localStorage.setItem('conecta_ies_token', token)       │
│  localStorage.setItem('conecta_ies_user', usuario)      │
│           ↓                                              │
│  Router.navigate(['/home'])                             │
└─────────────────────────────────────────────────────────┘
```

---

**Status:** ✅ **Backend e Frontend 100% sincronizados e prontos para produção!**
