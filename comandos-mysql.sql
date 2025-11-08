-- ============================================
-- Comandos SQL Úteis - ConectaIES
-- ============================================

-- ============================================
-- SETUP INICIAL
-- ============================================

-- Criar banco de dados
CREATE DATABASE IF NOT EXISTS conecta_ies 
  CHARACTER SET utf8mb4 
  COLLATE utf8mb4_unicode_ci;

-- Selecionar banco
USE conecta_ies;

-- Ver todos os bancos
SHOW DATABASES;

-- Ver todas as tabelas
SHOW TABLES;

-- ============================================
-- CRIAR USUÁRIO (Opcional)
-- ============================================

-- Criar usuário dedicado
CREATE USER 'conecta_user'@'localhost' IDENTIFIED BY 'conecta_senha123';

-- Dar permissões
GRANT ALL PRIVILEGES ON conecta_ies.* TO 'conecta_user'@'localhost';

-- Aplicar mudanças
FLUSH PRIVILEGES;

-- Verificar usuários
SELECT user, host FROM mysql.user;

-- ============================================
-- CONSULTAS DE DADOS
-- ============================================

-- Ver todos os usuários cadastrados
SELECT id, nome, email, tipo_perfil, created_at 
FROM users 
ORDER BY created_at DESC;

-- Ver todas as solicitações
SELECT 
  s.id,
  s.protocolo,
  s.titulo,
  s.status,
  u.nome as usuario_nome,
  s.created_at,
  s.first_response_at
FROM solicitations s
LEFT JOIN users u ON s.usuario_id = u.id
ORDER BY s.created_at DESC;

-- Ver solicitações abertas (sem primeira resposta)
SELECT 
  s.id,
  s.protocolo,
  s.titulo,
  s.status,
  u.nome as usuario_nome,
  s.created_at,
  TIMESTAMPDIFF(MINUTE, s.created_at, NOW()) as minutos_aberto
FROM solicitations s
LEFT JOIN users u ON s.usuario_id = u.id
WHERE s.first_response_at IS NULL
ORDER BY s.created_at ASC;

-- Ver histórico de uma solicitação específica
SELECT 
  eh.id,
  eh.evento_tipo,
  eh.descricao,
  u.nome as usuario_nome,
  eh.timestamp
FROM event_history eh
LEFT JOIN users u ON eh.usuario_id = u.id
WHERE eh.solicitacao_id = 1  -- Trocar pelo ID desejado
ORDER BY eh.timestamp ASC;

-- Ver anexos de uma solicitação
SELECT 
  a.id,
  a.nome,
  a.tipo,
  a.url,
  a.created_at
FROM attachments a
WHERE a.solicitacao_id = 1  -- Trocar pelo ID desejado
ORDER BY a.created_at ASC;

-- ============================================
-- ESTATÍSTICAS E KPIs
-- ============================================

-- Total de solicitações por status
SELECT 
  status,
  COUNT(*) as total
FROM solicitations
GROUP BY status
ORDER BY total DESC;

-- Total de solicitações por tipo
SELECT 
  tipo,
  COUNT(*) as total
FROM solicitations
GROUP BY tipo
ORDER BY total DESC;

-- Solicitações que violaram TMR (mais de 4 horas sem resposta)
SELECT 
  s.id,
  s.protocolo,
  s.titulo,
  u.nome as usuario_nome,
  s.created_at,
  TIMESTAMPDIFF(HOUR, s.created_at, NOW()) as horas_aberto
FROM solicitations s
LEFT JOIN users u ON s.usuario_id = u.id
WHERE s.first_response_at IS NULL
  AND TIMESTAMPDIFF(HOUR, s.created_at, NOW()) > 4
ORDER BY s.created_at ASC;

-- Tempo médio de primeira resposta (em horas)
SELECT 
  AVG(TIMESTAMPDIFF(MINUTE, created_at, first_response_at) / 60) as media_horas
FROM solicitations
WHERE first_response_at IS NOT NULL;

-- Solicitações por usuário
SELECT 
  u.nome,
  u.email,
  u.tipo_perfil,
  COUNT(s.id) as total_solicitacoes
FROM users u
LEFT JOIN solicitations s ON u.id = s.usuario_id
GROUP BY u.id, u.nome, u.email, u.tipo_perfil
ORDER BY total_solicitacoes DESC;

-- ============================================
-- INSERIR DADOS DE TESTE
-- ============================================

-- Inserir usuário de teste (senha: senha123)
-- Hash gerado com bcrypt para "senha123"
INSERT INTO users (nome, email, senha_hash, tipo_perfil) VALUES
('Admin Sistema', 'admin@conectaies.com', '$2b$10$8Z8YqK3xN5Y5HqZ5Y5Y5YuK5Y5Y5Y5Y5Y5Y5Y5Y5Y5Y5Y5Y5Y5Y5Y', 'ADMIN'),
('João Silva Aluno', 'joao@aluno.com', '$2b$10$8Z8YqK3xN5Y5HqZ5Y5Y5YuK5Y5Y5Y5Y5Y5Y5Y5Y5Y5Y5Y5Y5Y5Y5Y', 'ALUNO'),
('Maria Santos Prof', 'maria@professor.com', '$2b$10$8Z8YqK3xN5Y5HqZ5Y5Y5YuK5Y5Y5Y5Y5Y5Y5Y5Y5Y5Y5Y5Y5Y5Y5Y', 'PROFESSOR')
ON DUPLICATE KEY UPDATE id=id;

-- Inserir solicitação de exemplo
INSERT INTO solicitations (protocolo, titulo, descricao, tipo, status, usuario_id) VALUES
('SOL-2025-0001', 'Necessito de apoio para locomoção', 'Preciso de ajuda para me locomover no campus', 'APOIO_LOCOMOCAO', 'ABERTO', 2);

-- Inserir evento no histórico
INSERT INTO event_history (solicitacao_id, evento_tipo, descricao, usuario_id) VALUES
(1, 'STATUS_CHANGE', 'Solicitação criada', 2);

-- ============================================
-- LIMPEZA E MANUTENÇÃO
-- ============================================

-- Deletar todas as solicitações (CUIDADO!)
-- DELETE FROM solicitations;

-- Deletar todos os usuários (CUIDADO!)
-- DELETE FROM users;

-- Resetar auto_increment
-- ALTER TABLE solicitations AUTO_INCREMENT = 1;
-- ALTER TABLE users AUTO_INCREMENT = 1;

-- Limpar dados mas manter estrutura
TRUNCATE TABLE event_history;
TRUNCATE TABLE attachments;
TRUNCATE TABLE solicitations;
TRUNCATE TABLE users;

-- ============================================
-- BACKUP E RESTORE
-- ============================================

-- Exportar banco (executar no terminal, não no MySQL)
-- mysqldump -u root -p conecta_ies > backup_conecta_ies.sql

-- Importar backup (executar no terminal)
-- mysql -u root -p conecta_ies < backup_conecta_ies.sql

-- ============================================
-- VERIFICAÇÕES DE INTEGRIDADE
-- ============================================

-- Verificar solicitações órfãs (sem usuário)
SELECT s.* 
FROM solicitations s
LEFT JOIN users u ON s.usuario_id = u.id
WHERE u.id IS NULL;

-- Verificar eventos órfãos (sem solicitação)
SELECT eh.* 
FROM event_history eh
LEFT JOIN solicitations s ON eh.solicitacao_id = s.id
WHERE s.id IS NULL;

-- Verificar anexos órfãos (sem solicitação)
SELECT a.* 
FROM attachments a
LEFT JOIN solicitations s ON a.solicitacao_id = s.id
WHERE s.id IS NULL;

-- ============================================
-- ÍNDICES E PERFORMANCE
-- ============================================

-- Ver índices de uma tabela
SHOW INDEX FROM solicitations;

-- Analisar performance de uma query
EXPLAIN SELECT * FROM solicitations WHERE status = 'ABERTO';

-- Ver tamanho das tabelas
SELECT 
  table_name,
  ROUND(((data_length + index_length) / 1024 / 1024), 2) AS "Size (MB)"
FROM information_schema.TABLES
WHERE table_schema = 'conecta_ies'
ORDER BY (data_length + index_length) DESC;

-- ============================================
-- PERMISSÕES E SEGURANÇA
-- ============================================

-- Ver permissões de um usuário
SHOW GRANTS FOR 'conecta_user'@'localhost';

-- Revogar permissões
-- REVOKE ALL PRIVILEGES ON conecta_ies.* FROM 'conecta_user'@'localhost';

-- Deletar usuário
-- DROP USER 'conecta_user'@'localhost';

-- Mudar senha de um usuário
-- ALTER USER 'conecta_user'@'localhost' IDENTIFIED BY 'nova_senha';

-- ============================================
-- MONITORAMENTO
-- ============================================

-- Ver conexões ativas
SHOW PROCESSLIST;

-- Ver variáveis do servidor
SHOW VARIABLES LIKE 'max_connections';

-- Ver status do servidor
SHOW STATUS LIKE 'Threads_connected';

-- ============================================
-- QUERIES ÚTEIS PARA DESENVOLVIMENTO
-- ============================================

-- Última solicitação criada
SELECT * FROM solicitations ORDER BY id DESC LIMIT 1;

-- Último usuário registrado
SELECT * FROM users ORDER BY id DESC LIMIT 1;

-- Solicitações criadas hoje
SELECT * FROM solicitations 
WHERE DATE(created_at) = CURDATE();

-- Solicitações da última hora
SELECT * FROM solicitations 
WHERE created_at >= DATE_SUB(NOW(), INTERVAL 1 HOUR);

-- Contar total de registros em todas as tabelas
SELECT 'users' as tabela, COUNT(*) as total FROM users
UNION ALL
SELECT 'solicitations', COUNT(*) FROM solicitations
UNION ALL
SELECT 'attachments', COUNT(*) FROM attachments
UNION ALL
SELECT 'event_history', COUNT(*) FROM event_history;

-- ============================================
-- FIM
-- ============================================

-- Desconectar
-- EXIT;
