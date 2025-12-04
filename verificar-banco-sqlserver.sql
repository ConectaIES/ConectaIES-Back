-- ========================================
-- Script de Verificação SQL Server
-- ConectaIES Backend
-- ========================================

USE conecta_ies;
GO

PRINT '🔍 Verificando banco de dados: conecta_ies';
PRINT '';

-- 1. Verificar se o banco existe
PRINT '📊 Informações do Banco:';
SELECT 
    name AS 'Nome do Banco',
    database_id AS 'ID',
    create_date AS 'Data de Criação',
    compatibility_level AS 'Nível de Compatibilidade'
FROM sys.databases 
WHERE name = 'conecta_ies';
GO

PRINT '';
PRINT '📋 Tabelas Existentes:';

-- 2. Listar todas as tabelas
SELECT 
    t.name AS 'Nome da Tabela',
    SUM(p.rows) AS 'Total de Registros'
FROM 
    sys.tables t
INNER JOIN 
    sys.partitions p ON t.object_id = p.object_id
WHERE 
    p.index_id IN (0,1)
GROUP BY 
    t.name
ORDER BY 
    t.name;
GO

PRINT '';
PRINT '✅ Verificando Tabela: users';

-- 3. Verificar estrutura da tabela users
IF OBJECT_ID('users', 'U') IS NOT NULL
BEGIN
    SELECT 
        c.name AS 'Coluna',
        t.name AS 'Tipo',
        c.max_length AS 'Tamanho',
        c.is_nullable AS 'Permite NULL',
        CASE WHEN i.is_primary_key = 1 THEN 'Sim' ELSE 'Não' END AS 'PK'
    FROM 
        sys.columns c
    INNER JOIN 
        sys.types t ON c.user_type_id = t.user_type_id
    LEFT JOIN 
        sys.index_columns ic ON ic.object_id = c.object_id AND ic.column_id = c.column_id
    LEFT JOIN 
        sys.indexes i ON ic.object_id = i.object_id AND ic.index_id = i.index_id AND i.is_primary_key = 1
    WHERE 
        c.object_id = OBJECT_ID('users')
    ORDER BY 
        c.column_id;
END
ELSE
BEGIN
    PRINT '❌ Tabela users NÃO encontrada!';
END
GO

PRINT '';
PRINT '✅ Verificando Tabela: solicitations';

-- 4. Verificar estrutura da tabela solicitations
IF OBJECT_ID('solicitations', 'U') IS NOT NULL
BEGIN
    SELECT 
        c.name AS 'Coluna',
        t.name AS 'Tipo',
        c.max_length AS 'Tamanho',
        c.is_nullable AS 'Permite NULL'
    FROM 
        sys.columns c
    INNER JOIN 
        sys.types t ON c.user_type_id = t.user_type_id
    WHERE 
        c.object_id = OBJECT_ID('solicitations')
    ORDER BY 
        c.column_id;
END
ELSE
BEGIN
    PRINT '❌ Tabela solicitations NÃO encontrada!';
END
GO

PRINT '';
PRINT '✅ Verificando Tabela: attachments';

-- 5. Verificar estrutura da tabela attachments
IF OBJECT_ID('attachments', 'U') IS NOT NULL
BEGIN
    SELECT 
        c.name AS 'Coluna',
        t.name AS 'Tipo',
        c.max_length AS 'Tamanho'
    FROM 
        sys.columns c
    INNER JOIN 
        sys.types t ON c.user_type_id = t.user_type_id
    WHERE 
        c.object_id = OBJECT_ID('attachments')
    ORDER BY 
        c.column_id;
END
ELSE
BEGIN
    PRINT '❌ Tabela attachments NÃO encontrada!';
END
GO

PRINT '';
PRINT '✅ Verificando Tabela: event_history';

-- 6. Verificar estrutura da tabela event_history
IF OBJECT_ID('event_history', 'U') IS NOT NULL
BEGIN
    SELECT 
        c.name AS 'Coluna',
        t.name AS 'Tipo',
        c.max_length AS 'Tamanho'
    FROM 
        sys.columns c
    INNER JOIN 
        sys.types t ON c.user_type_id = t.user_type_id
    WHERE 
        c.object_id = OBJECT_ID('event_history')
    ORDER BY 
        c.column_id;
END
ELSE
BEGIN
    PRINT '❌ Tabela event_history NÃO encontrada!';
END
GO

PRINT '';
PRINT '🔗 Verificando Foreign Keys:';

-- 7. Verificar Foreign Keys
SELECT 
    fk.name AS 'Nome FK',
    OBJECT_NAME(fk.parent_object_id) AS 'Tabela Origem',
    COL_NAME(fkc.parent_object_id, fkc.parent_column_id) AS 'Coluna Origem',
    OBJECT_NAME(fk.referenced_object_id) AS 'Tabela Referenciada',
    COL_NAME(fkc.referenced_object_id, fkc.referenced_column_id) AS 'Coluna Referenciada'
FROM 
    sys.foreign_keys AS fk
INNER JOIN 
    sys.foreign_key_columns AS fkc ON fk.object_id = fkc.constraint_object_id
WHERE 
    OBJECT_NAME(fk.parent_object_id) IN ('solicitations', 'attachments', 'event_history')
ORDER BY 
    fk.name;
GO

PRINT '';
PRINT '📊 Resumo de Dados:';

-- 8. Contar registros em cada tabela
IF OBJECT_ID('users', 'U') IS NOT NULL
    SELECT COUNT(*) AS 'Total de Usuários' FROM users;

IF OBJECT_ID('solicitations', 'U') IS NOT NULL
    SELECT COUNT(*) AS 'Total de Solicitações' FROM solicitations;

IF OBJECT_ID('attachments', 'U') IS NOT NULL
    SELECT COUNT(*) AS 'Total de Anexos' FROM attachments;

IF OBJECT_ID('event_history', 'U') IS NOT NULL
    SELECT COUNT(*) AS 'Total de Eventos no Histórico' FROM event_history;
GO

PRINT '';
PRINT '✅ Verificação Completa!';
PRINT '';
PRINT '📝 Próximos passos:';
PRINT '1. Se as tabelas existem: npm run start:dev';
PRINT '2. Se falta alguma tabela: executar script de criação';
PRINT '3. Se estrutura está diferente: ajustar conforme necessário';
GO
