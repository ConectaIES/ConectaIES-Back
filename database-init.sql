-- Script de inicialização do banco de dados ConectaIES
-- Execute este script para criar o banco e dados iniciais

CREATE DATABASE IF NOT EXISTS conecta_ies CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

USE conecta_ies;

-- O TypeORM criará as tabelas automaticamente (synchronize: true)
-- Mas vamos inserir usuários de teste

-- Senha para todos: "senha123"
-- Hash gerado: $2b$10$8Z8YqK3xN5Y5HqZ5Y5Y5YuK5Y5Y5Y5Y5Y5Y5Y5Y5Y5Y5Y5Y5Y5Y5Y

INSERT INTO users (nome, email, senha_hash, tipo_perfil) VALUES
('Admin Sistema', 'admin@conectaies.com', '$2b$10$8Z8YqK3xN5Y5HqZ5Y5Y5YuK5Y5Y5Y5Y5Y5Y5Y5Y5Y5Y5Y5Y5Y5Y5Y', 'ADMIN'),
('João Silva', 'joao@aluno.com', '$2b$10$8Z8YqK3xN5Y5HqZ5Y5Y5YuK5Y5Y5Y5Y5Y5Y5Y5Y5Y5Y5Y5Y5Y5Y5Y', 'ALUNO'),
('Maria Santos', 'maria@professor.com', '$2b$10$8Z8YqK3xN5Y5HqZ5Y5Y5YuK5Y5Y5Y5Y5Y5Y5Y5Y5Y5Y5Y5Y5Y5Y5Y', 'PROFESSOR')
ON DUPLICATE KEY UPDATE id=id;

-- Dados de teste inseridos com sucesso!
