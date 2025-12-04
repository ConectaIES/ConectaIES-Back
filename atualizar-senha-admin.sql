-- =====================================================
-- Script para Atualizar Senha do Admin
-- =====================================================
USE conecta_ies;
GO

-- Atualizar senha do admin para: admin123
-- Hash: $2b$10$m9WYgkJbmCGKODEWL7NnAu9I88SE7tkFNQyYJ44yWGqPOqXxAgNua

UPDATE users
SET senha_hash = '$2b$10$m9WYgkJbmCGKODEWL7NnAu9I88SE7tkFNQyYJ44yWGqPOqXxAgNua',
    updated_at = GETDATE()
WHERE email = 'admin@conectaies.com';

PRINT 'Senha do admin atualizada com sucesso!';
PRINT 'Email: admin@conectaies.com';
PRINT 'Senha: admin123';
GO
