-- =====================================================
-- Script de Setup/Reset do Banco de Dados ConectaIES
-- SQL Server 2019+
-- =====================================================
-- Este script verifica a existência das tabelas e as cria se não existirem
-- Se existirem, limpa os dados mas mantém a estrutura
-- Cria um usuário ADMIN padrão para testes
-- =====================================================

USE conecta_ies;
GO

-- =====================================================
-- 1. TABELA: users
-- =====================================================
IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'users')
BEGIN
    PRINT 'Criando tabela users...';
    
    CREATE TABLE users (
        id INT IDENTITY(1,1) PRIMARY KEY,
        nome NVARCHAR(200) NOT NULL,
        email NVARCHAR(200) NOT NULL UNIQUE,
        senha_hash NVARCHAR(255) NOT NULL,
        tipo_perfil NVARCHAR(20) NOT NULL CHECK (tipo_perfil IN ('ALUNO', 'PROFESSOR', 'ADMIN')),
        matricula NVARCHAR(50) NULL,
        created_at DATETIME2 DEFAULT GETDATE(),
        updated_at DATETIME2 DEFAULT GETDATE()
    );
    
    -- Índices para performance
    CREATE INDEX idx_users_email ON users(email);
    CREATE INDEX idx_users_tipo_perfil ON users(tipo_perfil);
    
    PRINT 'Tabela users criada com sucesso!';
END
ELSE
BEGIN
    PRINT 'Tabela users já existe. Limpando dados...';
    
    -- Limpar dados (as constraints de FK serão respeitadas)
    DELETE FROM users;
    DBCC CHECKIDENT ('users', RESEED, 0);
    
    PRINT 'Tabela users limpa!';
END
GO

-- =====================================================
-- 2. TABELA: solicitations
-- =====================================================
IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'solicitations')
BEGIN
    PRINT 'Criando tabela solicitations...';
    
    CREATE TABLE solicitations (
        id INT IDENTITY(1,1) PRIMARY KEY,
        protocolo NVARCHAR(50) NOT NULL UNIQUE,
        titulo NVARCHAR(200) NOT NULL,
        descricao NVARCHAR(MAX) NOT NULL,
        tipo NVARCHAR(50) NOT NULL CHECK (tipo IN ('APOIO_LOCOMOCAO', 'INTERPRETACAO_LIBRAS', 'OUTROS')),
        status NVARCHAR(50) NOT NULL DEFAULT 'ABERTO' CHECK (status IN ('ABERTO', 'NAO_VISTO', 'EM_ANALISE', 'EM_EXECUCAO', 'RESOLVIDO')),
        usuario_id INT NOT NULL,
        created_at DATETIME2 DEFAULT GETDATE(),
        updated_at DATETIME2 DEFAULT GETDATE(),
        first_response_at DATETIME2 NULL,
        CONSTRAINT fk_solicitation_user FOREIGN KEY (usuario_id) REFERENCES users(id) ON DELETE CASCADE
    );
    
    -- Índices para performance
    CREATE INDEX idx_solicitations_protocolo ON solicitations(protocolo);
    CREATE INDEX idx_solicitations_usuario_id ON solicitations(usuario_id);
    CREATE INDEX idx_solicitations_status ON solicitations(status);
    CREATE INDEX idx_solicitations_tipo ON solicitations(tipo);
    CREATE INDEX idx_solicitations_created_at ON solicitations(created_at);
    
    PRINT 'Tabela solicitations criada com sucesso!';
END
ELSE
BEGIN
    PRINT 'Tabela solicitations já existe. Limpando dados...';
    
    DELETE FROM solicitations;
    DBCC CHECKIDENT ('solicitations', RESEED, 0);
    
    PRINT 'Tabela solicitations limpa!';
END
GO

-- =====================================================
-- 3. TABELA: attachments
-- =====================================================
IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'attachments')
BEGIN
    PRINT 'Criando tabela attachments...';
    
    CREATE TABLE attachments (
        id INT IDENTITY(1,1) PRIMARY KEY,
        solicitacao_id INT NOT NULL,
        nome NVARCHAR(255) NOT NULL,
        url NVARCHAR(500) NOT NULL,
        tipo NVARCHAR(100) NOT NULL,
        created_at DATETIME2 DEFAULT GETDATE(),
        CONSTRAINT fk_attachment_solicitation FOREIGN KEY (solicitacao_id) REFERENCES solicitations(id) ON DELETE CASCADE
    );
    
    -- Índices para performance
    CREATE INDEX idx_attachments_solicitacao_id ON attachments(solicitacao_id);
    
    PRINT 'Tabela attachments criada com sucesso!';
END
ELSE
BEGIN
    PRINT 'Tabela attachments já existe. Limpando dados...';
    
    DELETE FROM attachments;
    DBCC CHECKIDENT ('attachments', RESEED, 0);
    
    PRINT 'Tabela attachments limpa!';
END
GO

-- =====================================================
-- 4. TABELA: event_history
-- =====================================================
IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'event_history')
BEGIN
    PRINT 'Criando tabela event_history...';
    
    CREATE TABLE event_history (
        id INT IDENTITY(1,1) PRIMARY KEY,
        solicitacao_id INT NOT NULL,
        evento_tipo NVARCHAR(50) NOT NULL CHECK (evento_tipo IN ('STATUS_CHANGE', 'COMMENT', 'ATTACHMENT')),
        descricao NVARCHAR(MAX) NOT NULL,
        usuario_id INT NULL,
        timestamp DATETIME2 DEFAULT GETDATE(),
        CONSTRAINT fk_event_solicitation FOREIGN KEY (solicitacao_id) REFERENCES solicitations(id) ON DELETE CASCADE,
        CONSTRAINT fk_event_user FOREIGN KEY (usuario_id) REFERENCES users(id) ON DELETE SET NULL
    );
    
    -- Índices para performance
    CREATE INDEX idx_event_history_solicitacao_id ON event_history(solicitacao_id);
    CREATE INDEX idx_event_history_usuario_id ON event_history(usuario_id);
    CREATE INDEX idx_event_history_timestamp ON event_history(timestamp);
    
    PRINT 'Tabela event_history criada com sucesso!';
END
ELSE
BEGIN
    PRINT 'Tabela event_history já existe. Limpando dados...';
    
    DELETE FROM event_history;
    DBCC CHECKIDENT ('event_history', RESEED, 0);
    
    PRINT 'Tabela event_history limpa!';
END
GO

-- =====================================================
-- 5. CRIAR USUÁRIO ADMIN PADRÃO
-- =====================================================
PRINT 'Criando usuário ADMIN padrão...';

-- Senha: admin123
-- Hash gerado com bcrypt (salt rounds: 10)
-- Para gerar um novo hash, use: bcrypt.hash('sua_senha', 10)
INSERT INTO users (nome, email, senha_hash, tipo_perfil, matricula, created_at, updated_at)
VALUES (
    'Administrador do Sistema',
    'admin@conectaies.com',
    '$2b$10$rqGHWQxLZ4Y.PqXdKMxwCeLvFIrPRQxJGKLQKGqXYwKGZx1qLJ9Bi',
    'ADMIN',
    'ADM001',
    GETDATE(),
    GETDATE()
);

PRINT 'Usuário ADMIN criado com sucesso!';
PRINT '';
PRINT '====================================================';
PRINT 'CREDENCIAIS DO ADMIN:';
PRINT 'Email: admin@conectaies.com';
PRINT 'Senha: admin123';
PRINT '====================================================';
PRINT '';

-- =====================================================
-- 6. VERIFICAÇÃO FINAL
-- =====================================================
PRINT 'Verificando estrutura do banco de dados...';
PRINT '';

SELECT 
    'users' as Tabela, 
    COUNT(*) as Total_Registros 
FROM users
UNION ALL
SELECT 
    'solicitations' as Tabela, 
    COUNT(*) as Total_Registros 
FROM solicitations
UNION ALL
SELECT 
    'attachments' as Tabela, 
    COUNT(*) as Total_Registros 
FROM attachments
UNION ALL
SELECT 
    'event_history' as Tabela, 
    COUNT(*) as Total_Registros 
FROM event_history;

PRINT '';
PRINT '====================================================';
PRINT 'SETUP CONCLUÍDO COM SUCESSO!';
PRINT '====================================================';
PRINT '';
PRINT 'Próximos passos:';
PRINT '1. Inicie o backend: npm run start:dev';
PRINT '2. Inicie o frontend: ng serve';
PRINT '3. Acesse http://localhost:4200';
PRINT '4. Faça login com: admin@conectaies.com / admin123';
PRINT '';
PRINT 'Estrutura do banco:';
PRINT '- 4 tabelas criadas';
PRINT '- Relacionamentos configurados';
PRINT '- Índices para performance aplicados';
PRINT '- 1 usuário ADMIN criado';
PRINT '';
PRINT 'IMPORTANTE: Altere a senha do admin após o primeiro login!';
PRINT '====================================================';
GO
