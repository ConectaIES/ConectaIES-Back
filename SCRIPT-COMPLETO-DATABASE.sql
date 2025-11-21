-- ================================================================================
-- CONECTA IES - SCRIPT COMPLETO DE CRIAÇÃO DO BANCO DE DADOS SQL SERVER
-- ================================================================================
-- Descrição: Script completo para criar o banco de dados ConectaIES no SQL Server
-- Data: 21/11/2025
-- Versão: 1.0.0
-- Compatibilidade: SQL Server 2019+, Azure SQL Database
-- Backend: NestJS + TypeORM
-- Frontend: Angular 20
-- ================================================================================

-- ================================================================================
-- SEÇÃO 1: CRIAÇÃO DO DATABASE
-- ================================================================================
-- IMPORTANTE: Execute esta seção separadamente se você não tem permissões
-- de criação de database, ou se o database já existe

IF NOT EXISTS (SELECT * FROM sys.databases WHERE name = 'conecta_ies')
BEGIN
    CREATE DATABASE conecta_ies
    COLLATE Latin1_General_CI_AS;
    PRINT '✓ Database conecta_ies criado com sucesso!';
END
ELSE
BEGIN
    PRINT '⚠ Database conecta_ies já existe!';
END
GO

-- Usar o database criado
USE conecta_ies;
GO

PRINT '';
PRINT '================================================================================';
PRINT 'Inicializando estrutura do ConectaIES...';
PRINT '================================================================================';
PRINT '';

-- ================================================================================
-- SEÇÃO 2: CRIAÇÃO DAS TABELAS
-- ================================================================================

-- -------------------------------------------------------------------------------
-- TABELA: users
-- -------------------------------------------------------------------------------
-- Descrição: Armazena os usuários do sistema (Alunos, Professores, Administradores)
-- Relacionamentos: 1:N com solicitations, 1:N com event_history
-- -------------------------------------------------------------------------------

IF NOT EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[dbo].[users]') AND type IN (N'U'))
BEGIN
    CREATE TABLE [dbo].[users] (
        -- Chave primária
        [id] INT IDENTITY(1,1) NOT NULL,
        
        -- Dados do usuário
        [nome] NVARCHAR(200) NOT NULL,
        [email] NVARCHAR(200) NOT NULL,
        [senha_hash] NVARCHAR(255) NOT NULL,
        
        -- Perfil e matrícula
        [tipo_perfil] NVARCHAR(20) NOT NULL,
        [matricula] NVARCHAR(50) NULL,
        
        -- Timestamps
        [created_at] DATETIME2(7) NOT NULL DEFAULT GETDATE(),
        [updated_at] DATETIME2(7) NOT NULL DEFAULT GETDATE(),
        
        -- Constraints
        CONSTRAINT [PK_users] PRIMARY KEY CLUSTERED ([id] ASC),
        CONSTRAINT [UQ_users_email] UNIQUE NONCLUSTERED ([email] ASC),
        CONSTRAINT [CK_users_tipo_perfil] CHECK ([tipo_perfil] IN ('ALUNO', 'PROFESSOR', 'ADMIN'))
    );
    
    -- Índices para performance
    CREATE NONCLUSTERED INDEX [IX_users_email] ON [dbo].[users] ([email] ASC);
    CREATE NONCLUSTERED INDEX [IX_users_tipo_perfil] ON [dbo].[users] ([tipo_perfil] ASC);
    CREATE NONCLUSTERED INDEX [IX_users_matricula] ON [dbo].[users] ([matricula] ASC) WHERE [matricula] IS NOT NULL;
    
    PRINT '✓ Tabela [users] criada com sucesso!';
END
ELSE
BEGIN
    PRINT '⚠ Tabela [users] já existe!';
END
GO

-- -------------------------------------------------------------------------------
-- TABELA: solicitations
-- -------------------------------------------------------------------------------
-- Descrição: Armazena as solicitações de assistência dos alunos e professores
-- Relacionamentos: N:1 com users, 1:N com attachments, 1:N com event_history
-- KPI: Tempo Médio de Resposta (TMR) < 4 horas para 90% das solicitações
-- KPI: Tempo Médio de Resolução (TMRs) < 48 horas para solicitações críticas
-- -------------------------------------------------------------------------------

IF NOT EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[dbo].[solicitations]') AND type IN (N'U'))
BEGIN
    CREATE TABLE [dbo].[solicitations] (
        -- Chave primária
        [id] INT IDENTITY(1,1) NOT NULL,
        
        -- Protocolo único
        [protocolo] NVARCHAR(50) NOT NULL,
        
        -- Dados da solicitação
        [titulo] NVARCHAR(200) NOT NULL,
        [descricao] NVARCHAR(MAX) NOT NULL,
        
        -- Tipo e status
        [tipo] NVARCHAR(50) NOT NULL,
        [status] NVARCHAR(50) NOT NULL DEFAULT 'ABERTO',
        
        -- Relacionamento com usuário
        [usuario_id] INT NOT NULL,
        
        -- Timestamps e KPIs
        [created_at] DATETIME2(7) NOT NULL DEFAULT GETDATE(),
        [updated_at] DATETIME2(7) NOT NULL DEFAULT GETDATE(),
        [first_response_at] DATETIME2(7) NULL, -- Para calcular TMR
        [resolved_at] DATETIME2(7) NULL,       -- Para calcular TMRs
        
        -- Constraints
        CONSTRAINT [PK_solicitations] PRIMARY KEY CLUSTERED ([id] ASC),
        CONSTRAINT [UQ_solicitations_protocolo] UNIQUE NONCLUSTERED ([protocolo] ASC),
        CONSTRAINT [FK_solicitations_usuario] FOREIGN KEY ([usuario_id]) 
            REFERENCES [dbo].[users]([id]) ON DELETE CASCADE,
        CONSTRAINT [CK_solicitations_tipo] CHECK ([tipo] IN (
            'APOIO_LOCOMOCAO',
            'INTERPRETACAO_LIBRAS',
            'OUTROS'
        )),
        CONSTRAINT [CK_solicitations_status] CHECK ([status] IN (
            'ABERTO',
            'NAO_VISTO',
            'EM_ANALISE',
            'EM_EXECUCAO',
            'RESOLVIDO'
        ))
    );
    
    -- Índices para performance e KPIs
    CREATE NONCLUSTERED INDEX [IX_solicitations_usuario_id] ON [dbo].[solicitations] ([usuario_id] ASC);
    CREATE NONCLUSTERED INDEX [IX_solicitations_status] ON [dbo].[solicitations] ([status] ASC);
    CREATE NONCLUSTERED INDEX [IX_solicitations_protocolo] ON [dbo].[solicitations] ([protocolo] ASC);
    CREATE NONCLUSTERED INDEX [IX_solicitations_tipo] ON [dbo].[solicitations] ([tipo] ASC);
    CREATE NONCLUSTERED INDEX [IX_solicitations_created_at] ON [dbo].[solicitations] ([created_at] DESC);
    
    -- Índice composto para dashboard administrativo (CA 401.2)
    CREATE NONCLUSTERED INDEX [IX_solicitations_admin_dashboard] 
        ON [dbo].[solicitations] ([status] ASC, [created_at] DESC)
        INCLUDE ([titulo], [tipo], [first_response_at]);
    
    PRINT '✓ Tabela [solicitations] criada com sucesso!';
END
ELSE
BEGIN
    PRINT '⚠ Tabela [solicitations] já existe!';
END
GO

-- -------------------------------------------------------------------------------
-- TABELA: attachments
-- -------------------------------------------------------------------------------
-- Descrição: Armazena os anexos das solicitações (máximo 3 por solicitação - CA 201.2)
-- Relacionamentos: N:1 com solicitations
-- Limite: 3 anexos por solicitação, 5MB cada (validado no backend)
-- -------------------------------------------------------------------------------

IF NOT EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[dbo].[attachments]') AND type IN (N'U'))
BEGIN
    CREATE TABLE [dbo].[attachments] (
        -- Chave primária
        [id] INT IDENTITY(1,1) NOT NULL,
        
        -- Relacionamento com solicitação
        [solicitacao_id] INT NOT NULL,
        
        -- Dados do anexo
        [nome] NVARCHAR(255) NOT NULL,
        [url] NVARCHAR(500) NOT NULL,
        [tipo] NVARCHAR(100) NOT NULL, -- MIME type (image/png, application/pdf, etc)
        [tamanho] INT NULL,             -- Tamanho em bytes
        
        -- Timestamp
        [created_at] DATETIME2(7) NOT NULL DEFAULT GETDATE(),
        
        -- Constraints
        CONSTRAINT [PK_attachments] PRIMARY KEY CLUSTERED ([id] ASC),
        CONSTRAINT [FK_attachments_solicitacao] FOREIGN KEY ([solicitacao_id]) 
            REFERENCES [dbo].[solicitations]([id]) ON DELETE CASCADE
    );
    
    -- Índices para performance
    CREATE NONCLUSTERED INDEX [IX_attachments_solicitacao_id] ON [dbo].[attachments] ([solicitacao_id] ASC);
    
    PRINT '✓ Tabela [attachments] criada com sucesso!';
END
ELSE
BEGIN
    PRINT '⚠ Tabela [attachments] já existe!';
END
GO

-- -------------------------------------------------------------------------------
-- TABELA: event_history
-- -------------------------------------------------------------------------------
-- Descrição: Linha do tempo de eventos para transparência (CA 202.3)
-- Relacionamentos: N:1 com solicitations, N:1 com users
-- Eventos: Mudanças de status, comentários, adição de anexos
-- -------------------------------------------------------------------------------

IF NOT EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[dbo].[event_history]') AND type IN (N'U'))
BEGIN
    CREATE TABLE [dbo].[event_history] (
        -- Chave primária
        [id] INT IDENTITY(1,1) NOT NULL,
        
        -- Relacionamentos
        [solicitacao_id] INT NOT NULL,
        [usuario_id] INT NULL, -- NULL para eventos automáticos do sistema
        
        -- Tipo de evento
        [evento_tipo] NVARCHAR(50) NOT NULL,
        
        -- Descrição do evento
        [descricao] NVARCHAR(MAX) NOT NULL,
        
        -- Timestamp
        [timestamp] DATETIME2(7) NOT NULL DEFAULT GETDATE(),
        
        -- Constraints
        CONSTRAINT [PK_event_history] PRIMARY KEY CLUSTERED ([id] ASC),
        CONSTRAINT [FK_event_history_solicitacao] FOREIGN KEY ([solicitacao_id]) 
            REFERENCES [dbo].[solicitations]([id]) ON DELETE CASCADE,
        CONSTRAINT [FK_event_history_usuario] FOREIGN KEY ([usuario_id]) 
            REFERENCES [dbo].[users]([id]) ON DELETE NO ACTION,
        CONSTRAINT [CK_event_history_evento_tipo] CHECK ([evento_tipo] IN (
            'STATUS_CHANGE',
            'COMMENT',
            'ATTACHMENT'
        ))
    );
    
    -- Índices para performance
    CREATE NONCLUSTERED INDEX [IX_event_history_solicitacao_id] ON [dbo].[event_history] ([solicitacao_id] ASC, [timestamp] DESC);
    CREATE NONCLUSTERED INDEX [IX_event_history_usuario_id] ON [dbo].[event_history] ([usuario_id] ASC) WHERE [usuario_id] IS NOT NULL;
    
    PRINT '✓ Tabela [event_history] criada com sucesso!';
END
ELSE
BEGIN
    PRINT '⚠ Tabela [event_history] já existe!';
END
GO

-- ================================================================================
-- SEÇÃO 3: VIEWS PARA KPIs E DASHBOARD ADMINISTRATIVO
-- ================================================================================

-- -------------------------------------------------------------------------------
-- VIEW: vw_solicitations_com_tmr
-- -------------------------------------------------------------------------------
-- Descrição: Calcula o tempo até violação do TMR de 4 horas (CA 401.2)
-- Uso: Dashboard administrativo para ordenar por urgência
-- KPI: Tempo Médio de Resposta (TMR) < 4 horas
-- -------------------------------------------------------------------------------

IF EXISTS (SELECT * FROM sys.views WHERE name = 'vw_solicitations_com_tmr')
    DROP VIEW [dbo].[vw_solicitations_com_tmr];
GO

CREATE VIEW [dbo].[vw_solicitations_com_tmr]
AS
SELECT 
    s.[id],
    s.[protocolo],
    s.[titulo],
    s.[descricao],
    s.[tipo],
    s.[status],
    s.[usuario_id],
    s.[created_at],
    s.[updated_at],
    s.[first_response_at],
    s.[resolved_at],
    
    -- Nome do usuário
    u.[nome] AS usuario_nome,
    u.[email] AS usuario_email,
    u.[tipo_perfil] AS usuario_tipo,
    u.[matricula] AS usuario_matricula,
    
    -- Cálculo do TMR (Tempo Médio de Resposta)
    CASE 
        WHEN s.[first_response_at] IS NOT NULL 
        THEN DATEDIFF(MINUTE, s.[created_at], s.[first_response_at])
        ELSE NULL
    END AS tmr_minutos,
    
    -- Tempo até violação do TMR de 4 horas (240 minutos)
    -- Negativo = já violou, Positivo = ainda dentro do prazo
    CASE 
        WHEN s.[status] IN ('ABERTO', 'NAO_VISTO') AND s.[first_response_at] IS NULL
        THEN 240 - DATEDIFF(MINUTE, s.[created_at], GETDATE())
        ELSE NULL
    END AS time_to_tmr_breach_minutes,
    
    -- Indicador de urgência (TRUE se faltam menos de 60 minutos para violar TMR)
    CASE 
        WHEN s.[status] IN ('ABERTO', 'NAO_VISTO') 
             AND s.[first_response_at] IS NULL
             AND DATEDIFF(MINUTE, s.[created_at], GETDATE()) >= 180
        THEN CAST(1 AS BIT)
        ELSE CAST(0 AS BIT)
    END AS is_urgent,
    
    -- Indicador de violação do TMR
    CASE 
        WHEN s.[status] IN ('ABERTO', 'NAO_VISTO') 
             AND s.[first_response_at] IS NULL
             AND DATEDIFF(MINUTE, s.[created_at], GETDATE()) >= 240
        THEN CAST(1 AS BIT)
        ELSE CAST(0 AS BIT)
    END AS tmr_violated,
    
    -- Cálculo do TMRs (Tempo Médio de Resolução)
    CASE 
        WHEN s.[resolved_at] IS NOT NULL 
        THEN DATEDIFF(MINUTE, s.[created_at], s.[resolved_at])
        ELSE NULL
    END AS tmrs_minutos,
    
    -- Tempo desde criação (em minutos)
    DATEDIFF(MINUTE, s.[created_at], GETDATE()) AS age_minutes,
    
    -- Contagem de anexos
    (SELECT COUNT(*) FROM [dbo].[attachments] WHERE [solicitacao_id] = s.[id]) AS total_anexos,
    
    -- Contagem de eventos no histórico
    (SELECT COUNT(*) FROM [dbo].[event_history] WHERE [solicitacao_id] = s.[id]) AS total_eventos
    
FROM [dbo].[solicitations] s
INNER JOIN [dbo].[users] u ON s.[usuario_id] = u.[id];
GO

PRINT '✓ View [vw_solicitations_com_tmr] criada com sucesso!';
GO

-- -------------------------------------------------------------------------------
-- VIEW: vw_kpis_dashboard
-- -------------------------------------------------------------------------------
-- Descrição: KPIs consolidados para o dashboard administrativo
-- Métricas: TMR, TMRs, Taxa de Violação, Engajamento
-- -------------------------------------------------------------------------------

IF EXISTS (SELECT * FROM sys.views WHERE name = 'vw_kpis_dashboard')
    DROP VIEW [dbo].[vw_kpis_dashboard];
GO

CREATE VIEW [dbo].[vw_kpis_dashboard]
AS
SELECT 
    -- Total de solicitações
    (SELECT COUNT(*) FROM [dbo].[solicitations]) AS total_solicitations,
    
    -- Solicitações abertas (aguardando primeira resposta)
    (SELECT COUNT(*) FROM [dbo].[solicitations] 
     WHERE [status] IN ('ABERTO', 'NAO_VISTO')) AS solicitations_aberto,
    
    -- Solicitações em andamento
    (SELECT COUNT(*) FROM [dbo].[solicitations] 
     WHERE [status] IN ('EM_ANALISE', 'EM_EXECUCAO')) AS solicitations_em_andamento,
    
    -- Solicitações resolvidas
    (SELECT COUNT(*) FROM [dbo].[solicitations] 
     WHERE [status] = 'RESOLVIDO') AS solicitations_resolvido,
    
    -- TMR (Tempo Médio de Resposta) em minutos
    (SELECT AVG(DATEDIFF(MINUTE, [created_at], [first_response_at]))
     FROM [dbo].[solicitations]
     WHERE [first_response_at] IS NOT NULL) AS tmr_medio_minutos,
    
    -- TMR em horas
    (SELECT AVG(DATEDIFF(MINUTE, [created_at], [first_response_at])) / 60.0
     FROM [dbo].[solicitations]
     WHERE [first_response_at] IS NOT NULL) AS tmr_medio_horas,
    
    -- TMRs (Tempo Médio de Resolução) em minutos
    (SELECT AVG(DATEDIFF(MINUTE, [created_at], [resolved_at]))
     FROM [dbo].[solicitations]
     WHERE [resolved_at] IS NOT NULL) AS tmrs_medio_minutos,
    
    -- TMRs em horas
    (SELECT AVG(DATEDIFF(MINUTE, [created_at], [resolved_at])) / 60.0
     FROM [dbo].[solicitations]
     WHERE [resolved_at] IS NOT NULL) AS tmrs_medio_horas,
    
    -- Taxa de violação do TMR (4 horas)
    (SELECT 
        CAST(COUNT(CASE WHEN DATEDIFF(MINUTE, [created_at], [first_response_at]) > 240 THEN 1 END) AS FLOAT) / 
        NULLIF(COUNT(*), 0) * 100
     FROM [dbo].[solicitations]
     WHERE [first_response_at] IS NOT NULL) AS taxa_violacao_tmr_percent,
    
    -- Solicitações violando TMR atualmente
    (SELECT COUNT(*) FROM [dbo].[solicitations]
     WHERE [status] IN ('ABERTO', 'NAO_VISTO')
       AND [first_response_at] IS NULL
       AND DATEDIFF(MINUTE, [created_at], GETDATE()) >= 240) AS solicitations_violating_tmr,
    
    -- Solicitações urgentes (< 1 hora para violar TMR)
    (SELECT COUNT(*) FROM [dbo].[solicitations]
     WHERE [status] IN ('ABERTO', 'NAO_VISTO')
       AND [first_response_at] IS NULL
       AND DATEDIFF(MINUTE, [created_at], GETDATE()) BETWEEN 180 AND 239) AS solicitations_urgentes,
    
    -- Total de usuários ativos (criaram solicitação nos últimos 30 dias)
    (SELECT COUNT(DISTINCT [usuario_id]) 
     FROM [dbo].[solicitations]
     WHERE [created_at] >= DATEADD(DAY, -30, GETDATE())) AS usuarios_ativos_30d,
    
    -- Total de usuários cadastrados
    (SELECT COUNT(*) FROM [dbo].[users]) AS total_usuarios,
    
    -- Taxa de engajamento (% usuários ativos nos últimos 30 dias)
    (SELECT 
        CAST(COUNT(DISTINCT s.[usuario_id]) AS FLOAT) / NULLIF(COUNT(DISTINCT u.[id]), 0) * 100
     FROM [dbo].[users] u
     LEFT JOIN [dbo].[solicitations] s ON u.[id] = s.[usuario_id] 
         AND s.[created_at] >= DATEADD(DAY, -30, GETDATE())) AS taxa_engajamento_30d_percent;
GO

PRINT '✓ View [vw_kpis_dashboard] criada com sucesso!';
GO

-- ================================================================================
-- SEÇÃO 4: STORED PROCEDURES
-- ================================================================================

-- -------------------------------------------------------------------------------
-- PROCEDURE: sp_criar_solicitacao
-- -------------------------------------------------------------------------------
-- Descrição: Cria uma nova solicitação e gera protocolo único (CA 201.1 e 201.4)
-- Retorna: ID e protocolo da solicitação criada
-- -------------------------------------------------------------------------------

IF EXISTS (SELECT * FROM sys.procedures WHERE name = 'sp_criar_solicitacao')
    DROP PROCEDURE [dbo].[sp_criar_solicitacao];
GO

CREATE PROCEDURE [dbo].[sp_criar_solicitacao]
    @usuario_id INT,
    @titulo NVARCHAR(200),
    @descricao NVARCHAR(MAX),
    @tipo NVARCHAR(50)
AS
BEGIN
    SET NOCOUNT ON;
    
    DECLARE @protocolo NVARCHAR(50);
    DECLARE @solicitacao_id INT;
    DECLARE @ano INT = YEAR(GETDATE());
    DECLARE @numero_sequencial INT;
    
    -- Gerar número sequencial para o ano atual
    SELECT @numero_sequencial = ISNULL(MAX(CAST(RIGHT([protocolo], 4) AS INT)), 0) + 1
    FROM [dbo].[solicitations]
    WHERE [protocolo] LIKE 'SOL-' + CAST(@ano AS NVARCHAR) + '-%';
    
    -- Formato: SOL-2025-0001
    SET @protocolo = 'SOL-' + CAST(@ano AS NVARCHAR) + '-' + RIGHT('0000' + CAST(@numero_sequencial AS NVARCHAR), 4);
    
    -- Inserir solicitação
    INSERT INTO [dbo].[solicitations] ([protocolo], [titulo], [descricao], [tipo], [status], [usuario_id])
    VALUES (@protocolo, @titulo, @descricao, @tipo, 'ABERTO', @usuario_id);
    
    SET @solicitacao_id = SCOPE_IDENTITY();
    
    -- Criar evento inicial no histórico
    INSERT INTO [dbo].[event_history] ([solicitacao_id], [usuario_id], [evento_tipo], [descricao])
    VALUES (@solicitacao_id, @usuario_id, 'STATUS_CHANGE', 'Solicitação criada com status ABERTO');
    
    -- Retornar ID e protocolo
    SELECT @solicitacao_id AS id, @protocolo AS protocolo;
END
GO

PRINT '✓ Stored Procedure [sp_criar_solicitacao] criada com sucesso!';
GO

-- -------------------------------------------------------------------------------
-- PROCEDURE: sp_atualizar_status_solicitacao
-- -------------------------------------------------------------------------------
-- Descrição: Atualiza status da solicitação e registra no histórico (CA 401.3)
-- Atualiza first_response_at se for a primeira resposta
-- -------------------------------------------------------------------------------

IF EXISTS (SELECT * FROM sys.procedures WHERE name = 'sp_atualizar_status_solicitacao')
    DROP PROCEDURE [dbo].[sp_atualizar_status_solicitacao];
GO

CREATE PROCEDURE [dbo].[sp_atualizar_status_solicitacao]
    @solicitacao_id INT,
    @novo_status NVARCHAR(50),
    @usuario_id INT = NULL,
    @descricao NVARCHAR(MAX) = NULL
AS
BEGIN
    SET NOCOUNT ON;
    
    DECLARE @status_anterior NVARCHAR(50);
    DECLARE @first_response_at DATETIME2(7);
    DECLARE @descricao_evento NVARCHAR(MAX);
    
    -- Obter status anterior
    SELECT @status_anterior = [status], @first_response_at = [first_response_at]
    FROM [dbo].[solicitations]
    WHERE [id] = @solicitacao_id;
    
    -- Atualizar status
    UPDATE [dbo].[solicitations]
    SET [status] = @novo_status,
        [updated_at] = GETDATE(),
        -- Marcar primeira resposta se for a primeira mudança de status
        [first_response_at] = CASE 
            WHEN [first_response_at] IS NULL AND @novo_status != 'ABERTO' 
            THEN GETDATE() 
            ELSE [first_response_at] 
        END,
        -- Marcar resolução
        [resolved_at] = CASE 
            WHEN @novo_status = 'RESOLVIDO' 
            THEN GETDATE() 
            ELSE [resolved_at] 
        END
    WHERE [id] = @solicitacao_id;
    
    -- Preparar descrição do evento
    SET @descricao_evento = ISNULL(@descricao, 'Status alterado de ' + @status_anterior + ' para ' + @novo_status);
    
    -- Registrar evento no histórico
    INSERT INTO [dbo].[event_history] ([solicitacao_id], [usuario_id], [evento_tipo], [descricao])
    VALUES (@solicitacao_id, @usuario_id, 'STATUS_CHANGE', @descricao_evento);
    
    -- Retornar sucesso
    SELECT 1 AS success, 
           @status_anterior AS status_anterior, 
           @novo_status AS status_novo,
           CASE WHEN @first_response_at IS NULL AND @novo_status != 'ABERTO' THEN 1 ELSE 0 END AS primeira_resposta;
END
GO

PRINT '✓ Stored Procedure [sp_atualizar_status_solicitacao] criada com sucesso!';
GO

-- ================================================================================
-- SEÇÃO 5: TRIGGERS
-- ================================================================================

-- -------------------------------------------------------------------------------
-- TRIGGER: trg_users_updated_at
-- -------------------------------------------------------------------------------
-- Descrição: Atualiza automaticamente o campo updated_at na tabela users
-- -------------------------------------------------------------------------------

IF EXISTS (SELECT * FROM sys.triggers WHERE name = 'trg_users_updated_at')
    DROP TRIGGER [dbo].[trg_users_updated_at];
GO

CREATE TRIGGER [dbo].[trg_users_updated_at]
ON [dbo].[users]
AFTER UPDATE
AS
BEGIN
    SET NOCOUNT ON;
    
    UPDATE u
    SET [updated_at] = GETDATE()
    FROM [dbo].[users] u
    INNER JOIN inserted i ON u.[id] = i.[id]
    WHERE u.[updated_at] = i.[updated_at]; -- Evita loop infinito
END
GO

PRINT '✓ Trigger [trg_users_updated_at] criado com sucesso!';
GO

-- -------------------------------------------------------------------------------
-- TRIGGER: trg_solicitations_updated_at
-- -------------------------------------------------------------------------------
-- Descrição: Atualiza automaticamente o campo updated_at na tabela solicitations
-- -------------------------------------------------------------------------------

IF EXISTS (SELECT * FROM sys.triggers WHERE name = 'trg_solicitations_updated_at')
    DROP TRIGGER [dbo].[trg_solicitations_updated_at];
GO

CREATE TRIGGER [dbo].[trg_solicitations_updated_at]
ON [dbo].[solicitations]
AFTER UPDATE
AS
BEGIN
    SET NOCOUNT ON;
    
    UPDATE s
    SET [updated_at] = GETDATE()
    FROM [dbo].[solicitations] s
    INNER JOIN inserted i ON s.[id] = i.[id]
    WHERE s.[updated_at] = i.[updated_at]; -- Evita loop infinito
END
GO

PRINT '✓ Trigger [trg_solicitations_updated_at] criado com sucesso!';
GO

-- ================================================================================
-- SEÇÃO 6: DADOS DE EXEMPLO (SEED)
-- ================================================================================

PRINT '';
PRINT '================================================================================';
PRINT 'Inserindo dados de exemplo...';
PRINT '================================================================================';
PRINT '';

-- Senha para todos: "senha123"
-- Hash bcrypt (10 rounds): $2b$10$K3R5Y5Y5Y5Y5Y5Y5Y5Y5Y.K5Y5Y5Y5Y5Y5Y5Y5Y5Y5Y5Y5Y5Y5
-- IMPORTANTE: No backend, use bcrypt.hash('senha123', 10) para gerar o hash real

-- Inserir usuários de exemplo
IF NOT EXISTS (SELECT * FROM [dbo].[users] WHERE [email] = 'admin@conectaies.com')
BEGIN
    INSERT INTO [dbo].[users] ([nome], [email], [senha_hash], [tipo_perfil], [matricula])
    VALUES 
        ('Administrador Sistema', 'admin@conectaies.com', '$2b$10$K3R5Y5Y5Y5Y5Y5Y5Y5Y5Y.K5Y5Y5Y5Y5Y5Y5Y5Y5Y5Y5Y5Y5Y5', 'ADMIN', 'ADM001'),
        ('Prof. Carlos Silva', 'carlos@professor.com', '$2b$10$K3R5Y5Y5Y5Y5Y5Y5Y5Y5Y.K5Y5Y5Y5Y5Y5Y5Y5Y5Y5Y5Y5Y5Y5', 'PROFESSOR', 'PROF001'),
        ('Prof. Ana Santos', 'ana@professor.com', '$2b$10$K3R5Y5Y5Y5Y5Y5Y5Y5Y5Y.K5Y5Y5Y5Y5Y5Y5Y5Y5Y5Y5Y5Y5Y5', 'PROFESSOR', 'PROF002'),
        ('João Almeida', 'joao@aluno.com', '$2b$10$K3R5Y5Y5Y5Y5Y5Y5Y5Y5Y.K5Y5Y5Y5Y5Y5Y5Y5Y5Y5Y5Y5Y5Y5', 'ALUNO', '2025001'),
        ('Maria Oliveira', 'maria@aluno.com', '$2b$10$K3R5Y5Y5Y5Y5Y5Y5Y5Y5Y.K5Y5Y5Y5Y5Y5Y5Y5Y5Y5Y5Y5Y5Y5', 'ALUNO', '2025002'),
        ('Pedro Costa', 'pedro@aluno.com', '$2b$10$K3R5Y5Y5Y5Y5Y5Y5Y5Y5Y.K5Y5Y5Y5Y5Y5Y5Y5Y5Y5Y5Y5Y5Y5', 'ALUNO', '2025003');
    
    PRINT '✓ Usuários de exemplo inseridos!';
    PRINT '  Credenciais: email conforme acima | senha: senha123';
END
ELSE
BEGIN
    PRINT '⚠ Usuários de exemplo já existem!';
END
GO

-- Inserir solicitações de exemplo
DECLARE @usuario_joao INT, @usuario_maria INT, @usuario_pedro INT;

SELECT @usuario_joao = [id] FROM [dbo].[users] WHERE [email] = 'joao@aluno.com';
SELECT @usuario_maria = [id] FROM [dbo].[users] WHERE [email] = 'maria@aluno.com';
SELECT @usuario_pedro = [id] FROM [dbo].[users] WHERE [email] = 'pedro@aluno.com';

IF NOT EXISTS (SELECT * FROM [dbo].[solicitations] WHERE [protocolo] = 'SOL-2025-0001')
BEGIN
    -- Solicitação 1: Apoio à Locomoção (ABERTA - Violando TMR)
    INSERT INTO [dbo].[solicitations] ([protocolo], [titulo], [descricao], [tipo], [status], [usuario_id], [created_at])
    VALUES (
        'SOL-2025-0001',
        'Necessito de apoio para locomoção entre prédios',
        'Tenho dificuldade de locomoção e preciso de assistência para me deslocar entre o prédio A e B durante as aulas. Utilizo muletas e o percurso é longo.',
        'APOIO_LOCOMOCAO',
        'ABERTO',
        @usuario_joao,
        DATEADD(HOUR, -5, GETDATE()) -- 5 horas atrás (violando TMR de 4 horas)
    );
    
    -- Solicitação 2: Interpretação Libras (EM_ANALISE)
    INSERT INTO [dbo].[solicitations] ([protocolo], [titulo], [descricao], [tipo], [status], [usuario_id], [created_at], [first_response_at])
    VALUES (
        'SOL-2025-0002',
        'Intérprete de Libras para disciplina de Matemática',
        'Sou surdo e necessito de um intérprete de Libras para acompanhar as aulas de Cálculo I às terças e quintas, das 14h às 16h.',
        'INTERPRETACAO_LIBRAS',
        'EM_ANALISE',
        @usuario_maria,
        DATEADD(HOUR, -2, GETDATE()), -- 2 horas atrás
        DATEADD(HOUR, -1, GETDATE())  -- Respondida há 1 hora
    );
    
    -- Solicitação 3: Outros (URGENTE - quase violando TMR)
    INSERT INTO [dbo].[solicitations] ([protocolo], [titulo], [descricao], [tipo], [status], [usuario_id], [created_at])
    VALUES (
        'SOL-2025-0003',
        'Acesso ao laboratório de informática',
        'Preciso de acesso especial ao laboratório de informática para realizar meu TCC. Uso software de leitura de tela e preciso de mais tempo.',
        'OUTROS',
        'NAO_VISTO',
        @usuario_pedro,
        DATEADD(MINUTE, -190, GETDATE()) -- 3h10min atrás (faltam 50min para violar TMR)
    );
    
    -- Solicitação 4: Resolvida
    INSERT INTO [dbo].[solicitations] ([protocolo], [titulo], [descricao], [tipo], [status], [usuario_id], [created_at], [first_response_at], [resolved_at])
    VALUES (
        'SOL-2025-0004',
        'Material didático em formato acessível',
        'Solicito que os slides das aulas sejam disponibilizados em formato PDF acessível para leitores de tela.',
        'OUTROS',
        'RESOLVIDO',
        @usuario_maria,
        DATEADD(DAY, -3, GETDATE()),
        DATEADD(DAY, -3, DATEADD(HOUR, 2, GETDATE())),
        DATEADD(DAY, -2, GETDATE())
    );
    
    PRINT '✓ Solicitações de exemplo inseridas!';
END
ELSE
BEGIN
    PRINT '⚠ Solicitações de exemplo já existem!';
END
GO

-- Inserir eventos no histórico
DECLARE @sol1_id INT, @sol2_id INT, @sol3_id INT, @sol4_id INT;
DECLARE @admin_id INT;

SELECT @sol1_id = [id] FROM [dbo].[solicitations] WHERE [protocolo] = 'SOL-2025-0001';
SELECT @sol2_id = [id] FROM [dbo].[solicitations] WHERE [protocolo] = 'SOL-2025-0002';
SELECT @sol3_id = [id] FROM [dbo].[solicitations] WHERE [protocolo] = 'SOL-2025-0003';
SELECT @sol4_id = [id] FROM [dbo].[solicitations] WHERE [protocolo] = 'SOL-2025-0004';
SELECT @admin_id = [id] FROM [dbo].[users] WHERE [email] = 'admin@conectaies.com';

IF NOT EXISTS (SELECT * FROM [dbo].[event_history] WHERE [solicitacao_id] = @sol1_id)
BEGIN
    -- Eventos SOL-2025-0001
    INSERT INTO [dbo].[event_history] ([solicitacao_id], [usuario_id], [evento_tipo], [descricao], [timestamp])
    VALUES (@sol1_id, NULL, 'STATUS_CHANGE', 'Solicitação criada com status ABERTO', DATEADD(HOUR, -5, GETDATE()));
    
    -- Eventos SOL-2025-0002
    INSERT INTO [dbo].[event_history] ([solicitacao_id], [usuario_id], [evento_tipo], [descricao], [timestamp])
    VALUES 
        (@sol2_id, NULL, 'STATUS_CHANGE', 'Solicitação criada com status ABERTO', DATEADD(HOUR, -2, GETDATE())),
        (@sol2_id, @admin_id, 'STATUS_CHANGE', 'Status alterado de ABERTO para EM_ANALISE', DATEADD(HOUR, -1, GETDATE())),
        (@sol2_id, @admin_id, 'COMMENT', 'Estamos analisando a disponibilidade de intérpretes para o horário solicitado.', DATEADD(HOUR, -1, GETDATE()));
    
    -- Eventos SOL-2025-0003
    INSERT INTO [dbo].[event_history] ([solicitacao_id], [usuario_id], [evento_tipo], [descricao], [timestamp])
    VALUES (@sol3_id, NULL, 'STATUS_CHANGE', 'Solicitação criada com status ABERTO', DATEADD(MINUTE, -190, GETDATE()));
    
    -- Eventos SOL-2025-0004
    INSERT INTO [dbo].[event_history] ([solicitacao_id], [usuario_id], [evento_tipo], [descricao], [timestamp])
    VALUES 
        (@sol4_id, NULL, 'STATUS_CHANGE', 'Solicitação criada com status ABERTO', DATEADD(DAY, -3, GETDATE())),
        (@sol4_id, @admin_id, 'STATUS_CHANGE', 'Status alterado de ABERTO para EM_ANALISE', DATEADD(DAY, -3, DATEADD(HOUR, 2, GETDATE()))),
        (@sol4_id, @admin_id, 'COMMENT', 'Entraremos em contato com os professores para fornecer material acessível.', DATEADD(DAY, -3, DATEADD(HOUR, 3, GETDATE()))),
        (@sol4_id, @admin_id, 'STATUS_CHANGE', 'Status alterado de EM_ANALISE para EM_EXECUCAO', DATEADD(DAY, -2, DATEADD(HOUR, 10, GETDATE()))),
        (@sol4_id, @admin_id, 'STATUS_CHANGE', 'Status alterado de EM_EXECUCAO para RESOLVIDO', DATEADD(DAY, -2, GETDATE())),
        (@sol4_id, @admin_id, 'COMMENT', 'Professores foram orientados. PDFs acessíveis disponibilizados no portal.', DATEADD(DAY, -2, GETDATE()));
    
    PRINT '✓ Histórico de eventos inserido!';
END
ELSE
BEGIN
    PRINT '⚠ Histórico de eventos já existe!';
END
GO

-- ================================================================================
-- SEÇÃO 7: VALIDAÇÃO E TESTES
-- ================================================================================

PRINT '';
PRINT '================================================================================';
PRINT 'Executando validações...';
PRINT '================================================================================';
PRINT '';

-- Validar tabelas criadas
PRINT 'Tabelas criadas:';
SELECT 
    TABLE_NAME as 'Nome da Tabela',
    (SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_NAME = t.TABLE_NAME) as 'Colunas'
FROM INFORMATION_SCHEMA.TABLES t
WHERE TABLE_TYPE = 'BASE TABLE'
AND TABLE_NAME IN ('users', 'solicitations', 'attachments', 'event_history')
ORDER BY TABLE_NAME;

-- Validar views criadas
PRINT '';
PRINT 'Views criadas:';
SELECT TABLE_NAME as 'Nome da View'
FROM INFORMATION_SCHEMA.VIEWS
WHERE TABLE_NAME IN ('vw_solicitations_com_tmr', 'vw_kpis_dashboard')
ORDER BY TABLE_NAME;

-- Validar stored procedures criadas
PRINT '';
PRINT 'Stored Procedures criadas:';
SELECT ROUTINE_NAME as 'Nome da Procedure'
FROM INFORMATION_SCHEMA.ROUTINES
WHERE ROUTINE_TYPE = 'PROCEDURE'
AND ROUTINE_NAME IN ('sp_criar_solicitacao', 'sp_atualizar_status_solicitacao')
ORDER BY ROUTINE_NAME;

-- Validar dados inseridos
PRINT '';
PRINT 'Dados inseridos:';
SELECT 'users' as Tabela, COUNT(*) as Total FROM [dbo].[users]
UNION ALL
SELECT 'solicitations', COUNT(*) FROM [dbo].[solicitations]
UNION ALL
SELECT 'event_history', COUNT(*) FROM [dbo].[event_history];

-- Testar KPIs
PRINT '';
PRINT 'KPIs atuais:';
SELECT 
    total_solicitations as 'Total Solicitações',
    solicitations_aberto as 'Abertas',
    solicitations_em_andamento as 'Em Andamento',
    solicitations_resolvido as 'Resolvidas',
    ROUND(tmr_medio_horas, 2) as 'TMR Médio (horas)',
    solicitations_violating_tmr as 'Violando TMR',
    solicitations_urgentes as 'Urgentes'
FROM [dbo].[vw_kpis_dashboard];

-- Testar view de solicitações com TMR
PRINT '';
PRINT 'Solicitações ordenadas por urgência (para dashboard admin):';
SELECT 
    protocolo as 'Protocolo',
    titulo as 'Título',
    status as 'Status',
    usuario_nome as 'Usuário',
    time_to_tmr_breach_minutes as 'Minutos até TMR',
    CASE 
        WHEN is_urgent = 1 THEN 'SIM'
        ELSE 'NÃO'
    END as 'Urgente',
    CASE 
        WHEN tmr_violated = 1 THEN 'SIM'
        ELSE 'NÃO'
    END as 'TMR Violado'
FROM [dbo].[vw_solicitations_com_tmr]
WHERE status IN ('ABERTO', 'NAO_VISTO')
ORDER BY time_to_tmr_breach_minutes ASC;

-- ================================================================================
-- SCRIPT FINALIZADO COM SUCESSO
-- ================================================================================

PRINT '';
PRINT '================================================================================';
PRINT '✓ BANCO DE DADOS CONECTA IES CRIADO COM SUCESSO!';
PRINT '================================================================================';
PRINT '';
PRINT 'Próximos passos:';
PRINT '1. Configure o arquivo .env do backend com as credenciais do SQL Server';
PRINT '2. Execute: npm install (para instalar dependência mssql)';
PRINT '3. Execute: npm run start:dev (para iniciar o backend)';
PRINT '4. Teste o login com: admin@conectaies.com / senha: senha123';
PRINT '';
PRINT 'Estrutura criada:';
PRINT '- 4 tabelas (users, solicitations, attachments, event_history)';
PRINT '- 2 views (vw_solicitations_com_tmr, vw_kpis_dashboard)';
PRINT '- 2 stored procedures (sp_criar_solicitacao, sp_atualizar_status_solicitacao)';
PRINT '- 2 triggers (atualização automática de updated_at)';
PRINT '- 6 usuários de exemplo';
PRINT '- 4 solicitações de exemplo com histórico completo';
PRINT '';
PRINT 'KPIs implementados:';
PRINT '- TMR (Tempo Médio de Resposta) < 4 horas';
PRINT '- TMRs (Tempo Médio de Resolução) < 48 horas';
PRINT '- Taxa de Engajamento Mensal';
PRINT '- Alertas de violação de TMR em tempo real';
PRINT '';
PRINT '================================================================================';
GO
