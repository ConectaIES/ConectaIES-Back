# 🗄️ Setup do Banco de Dados - ConectaIES

## 📋 Pré-requisitos

1. **SQL Server 2019+** instalado e rodando
2. **Banco de dados `conecta_ies`** criado
3. **sqlcmd** instalado (vem com SQL Server)
4. Usuário com permissões (padrão: `sa`)

---

## 🚀 Como Executar

### **Executar Script SQL**

#### **Via SQLCMD (Terminal)**
```powershell
sqlcmd -S localhost,1433 -U sa -P sua_senha -d conecta_ies -i setup-database-sqlserver.sql
```

#### **Via SQL Server Management Studio (SSMS)**
1. Abra o SSMS
2. Conecte ao servidor
3. Selecione o banco `conecta_ies`
4. Abra o arquivo `setup-database-sqlserver.sql`
5. Execute (F5)

#### **Via Azure Data Studio**
1. Conecte ao servidor
2. Selecione o banco `conecta_ies`
3. Abra o arquivo `setup-database-sqlserver.sql`
4. Execute

---

## 📊 O Que o Script Faz

### **1. Validação de Tabelas**
- Verifica se cada tabela existe
- Se **não existe**: cria com estrutura completa
- Se **existe**: limpa os dados mas mantém a estrutura

### **2. Criação das Tabelas**

#### **users**
- Armazena usuários (ALUNO, PROFESSOR, ADMIN)
- Hash de senha com bcrypt
- Índices em email e tipo_perfil

#### **solicitations**
- Solicitações de acessibilidade
- Protocolo único
- Status e tipos definidos
- FK para users

#### **attachments**
- Anexos das solicitações
- Nome, URL e tipo do arquivo
- FK para solicitations (CASCADE)

#### **event_history**
- Histórico de eventos
- Mudanças de status, comentários, anexos
- FK para solicitations e users

### **3. Usuário Admin Padrão**
```
Email: admin@conectaies.com
Senha: admin123
Tipo: ADMIN
Matrícula: ADM001
```

⚠️ **IMPORTANTE**: Altere a senha após o primeiro login!

---

## 🔍 Verificação Pós-Setup

Após executar o script, você verá:

```
====================================================
SETUP CONCLUÍDO COM SUCESSO!
====================================================

Tabela              Total_Registros
users               1
solicitations       0
attachments         0
event_history       0

CREDENCIAIS DO ADMIN:
Email: admin@conectaies.com
Senha: admin123
====================================================
```

---

## 🧪 Testando a Configuração

### **1. Verificar Conexão Backend**
```powershell
cd ConectaIES-Back
npm run start:dev
```

Deve mostrar:
```
[Nest] Database connected successfully to conecta_ies
[Nest] Application is running on: http://localhost:3000
```

### **2. Testar Login via API**
```powershell
curl -X POST http://localhost:3000/auth/login `
  -H "Content-Type: application/json" `
  -d '{\"email\":\"admin@conectaies.com\",\"password\":\"admin123\"}'
```

Resposta esperada:
```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": 1,
    "nome": "Administrador do Sistema",
    "email": "admin@conectaies.com",
    "tipoPerfil": "ADMIN",
    "matricula": "ADM001"
  }
}
```

### **3. Testar Frontend**
```powershell
cd ConectaIES-Front/conecta-ies-front
ng serve
```

Acesse: http://localhost:4200
- Faça login com `admin@conectaies.com` / `admin123`
- Deve redirecionar para dashboard admin

---

## ❓ Troubleshooting

### **Erro: "Login failed for user 'sa'"**
- ✅ Verifique a senha
- ✅ Confirme que a autenticação SQL Server está habilitada

### **Erro: "Database 'conecta_ies' does not exist"**
Crie o banco primeiro:
```sql
CREATE DATABASE conecta_ies;
GO
```

### **Erro: "sqlcmd is not recognized"**
- ✅ Instale SQL Server Command Line Tools
- ✅ Adicione ao PATH do Windows

### **Erro: "Cannot open database requested by the login"**
- ✅ Verifique se o banco `conecta_ies` existe
- ✅ Confirme permissões do usuário

### **Backend não conecta**
Verifique `.env`:
```env
DB_HOST=localhost
DB_PORT=1433
DB_USERNAME=sa
DB_PASSWORD=sua_senha
DB_NAME=conecta_ies
```

---

## 🔄 Re-executando o Script

Você pode executar o script **múltiplas vezes** sem problemas:
- ✅ Tabelas existentes: dados são limpos
- ✅ Tabelas não existem: são criadas
- ✅ Estrutura sempre consistente
- ✅ Usuário admin sempre recriado

---

## 🔐 Segurança

### **Hash de Senha**
O script usa bcrypt com salt rounds = 10:
```
Senha: admin123
Hash: $2b$10$rqGHWQxLZ4Y.PqXdKMxwCeLvFIrPRQxJGKLQKGqXYwKGZx1qLJ9Bi
```

### **Para Gerar Novo Hash (Node.js)**
```javascript
const bcrypt = require('bcrypt');
const hash = await bcrypt.hash('nova_senha', 10);
console.log(hash);
```

### **Alterar Senha do Admin**
```sql
UPDATE users 
SET senha_hash = '$2b$10$SEU_NOVO_HASH_AQUI'
WHERE email = 'admin@conectaies.com';
```

---

## 📁 Estrutura de Arquivos

```
ConectaIES-Back/
├── setup-database-sqlserver.sql       # Script SQL principal
└── SETUP-DATABASE-GUIA.md             # Este guia
```

---

## ✅ Checklist Final

- [ ] SQL Server rodando
- [ ] Banco `conecta_ies` criado
- [ ] Script executado com sucesso
- [ ] Usuário admin criado
- [ ] Backend conecta ao banco
- [ ] Frontend acessa backend
- [ ] Login admin funciona
- [ ] Senha admin alterada (segurança)

---

## 📞 Suporte

Em caso de problemas:
1. Verifique os logs do SQL Server
2. Confirme todas as configurações do `.env`
3. Teste conexão com `sqlcmd` manualmente
4. Valide permissões do usuário SQL

---

**Última atualização**: Dezembro 2025  
**Versão**: 1.0  
**Compatível com**: SQL Server 2019+, Node.js 18+, Angular 20+
