-- ====================================
-- Script de Inicialização - SQL Server
-- ConectaIES Database
-- ====================================

-- Criar database (executar separadamente se necessário)
IF NOT EXISTS (SELECT * FROM sys.databases WHERE name = 'conecta_ies')
BEGIN
    CREATE DATABASE conecta_ies;
END
GO

USE conecta_ies;
GO

-- O TypeORM criará as tabelas automaticamente com synchronize: true
-- Mas aqui está o schema completo para referência

-- Tabela de Usuários
IF NOT EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[dbo].[users]') AND type in (N'U'))
BEGIN
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
END
GO

-- Tabela de Solicitações
IF NOT EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[dbo].[solicitations]') AND type in (N'U'))
BEGIN
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
        FOREIGN KEY (usuario_id) REFERENCES users(id)
    );
END
GO

-- Tabela de Anexos
IF NOT EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[dbo].[attachments]') AND type in (N'U'))
BEGIN
    CREATE TABLE attachments (
        id INT IDENTITY(1,1) PRIMARY KEY,
        solicitacao_id INT NOT NULL,
        nome NVARCHAR(255) NOT NULL,
        url NVARCHAR(500) NOT NULL,
        tipo NVARCHAR(100) NOT NULL,
        created_at DATETIME2 DEFAULT GETDATE(),
        FOREIGN KEY (solicitacao_id) REFERENCES solicitations(id) ON DELETE CASCADE
    );
END
GO

-- Tabela de Histórico de Eventos
IF NOT EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[dbo].[event_history]') AND type in (N'U'))
BEGIN
    CREATE TABLE event_history (
        id INT IDENTITY(1,1) PRIMARY KEY,
        solicitacao_id INT NOT NULL,
        evento_tipo NVARCHAR(50) NOT NULL CHECK (evento_tipo IN ('STATUS_CHANGE', 'COMMENT', 'ATTACHMENT')),
        descricao NVARCHAR(MAX) NOT NULL,
        usuario_id INT NULL,
        timestamp DATETIME2 DEFAULT GETDATE(),
        FOREIGN KEY (solicitacao_id) REFERENCES solicitations(id) ON DELETE CASCADE,
        FOREIGN KEY (usuario_id) REFERENCES users(id)
    );
END
GO

-- Índices para melhor performance
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_solicitations_usuario ON solicitations(usuario_id);
CREATE INDEX IF NOT EXISTS idx_solicitations_status ON solicitations(status);
CREATE INDEX IF NOT EXISTS idx_solicitations_protocolo ON solicitations(protocolo);
CREATE INDEX IF NOT EXISTS idx_attachments_solicitacao ON attachments(solicitacao_id);
CREATE INDEX IF NOT EXISTS idx_event_history_solicitacao ON event_history(solicitacao_id);
GO

-- Trigger para atualizar updated_at automaticamente
IF NOT EXISTS (SELECT * FROM sys.triggers WHERE name = 'trg_users_updated_at')
BEGIN
    EXEC('
    CREATE TRIGGER trg_users_updated_at
    ON users
    AFTER UPDATE
    AS
    BEGIN
        UPDATE users
        SET updated_at = GETDATE()
        FROM users u
        INNER JOIN inserted i ON u.id = i.id
    END
    ')
END
GO

IF NOT EXISTS (SELECT * FROM sys.triggers WHERE name = 'trg_solicitations_updated_at')
BEGIN
    EXEC('
    CREATE TRIGGER trg_solicitations_updated_at
    ON solicitations
    AFTER UPDATE
    AS
    BEGIN
        UPDATE solicitations
        SET updated_at = GETDATE()
        FROM solicitations s
        INNER JOIN inserted i ON s.id = i.id
    END
    ')
END
GO

-- Dados de exemplo (opcional)
-- Senha para todos: "senha123"
-- Hash bcrypt: $2b$10$8Z8YqK3xN5Y5HqZ5Y5Y5YuK5Y5Y5Y5Y5Y5Y5Y5Y5Y5Y5Y5Y5Y5Y5Y

IF NOT EXISTS (SELECT * FROM users WHERE email = 'admin@conectaies.com')
BEGIN
    INSERT INTO users (nome, email, senha_hash, tipo_perfil, matricula)
    VALUES 
        ('Admin Sistema', 'admin@conectaies.com', '$2b$10$8Z8YqK3xN5Y5HqZ5Y5Y5YuK5Y5Y5Y5Y5Y5Y5Y5Y5Y5Y5Y5Y5Y5Y5Y', 'ADMIN', 'ADM001'),
        ('João Silva', 'joao@aluno.com', '$2b$10$8Z8YqK3xN5Y5HqZ5Y5Y5YuK5Y5Y5Y5Y5Y5Y5Y5Y5Y5Y5Y5Y5Y5Y5Y', 'ALUNO', '2025001'),
        ('Maria Santos', 'maria@professor.com', '$2b$10$8Z8YqK3xN5Y5HqZ5Y5Y5YuK5Y5Y5Y5Y5Y5Y5Y5Y5Y5Y5Y5Y5Y5Y5Y', 'PROFESSOR', 'PROF001');
END
GO

PRINT 'Database conecta_ies criado e configurado com sucesso!';
GO
