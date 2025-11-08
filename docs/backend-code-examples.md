# Exemplos de Código Backend - ConectaIES

Este documento contém exemplos práticos de implementação do backend em Node.js/Express.

---

## 🔧 Setup Inicial

### package.json

```json
{
  "name": "conecta-ies-backend",
  "version": "1.0.0",
  "dependencies": {
    "express": "^4.18.2",
    "socket.io": "^4.7.2",
    "mysql2": "^3.6.0",
    "redis": "^4.6.10",
    "multer": "^1.4.5-lts.1",
    "jsonwebtoken": "^9.0.2",
    "bcrypt": "^5.1.1",
    "cors": "^2.8.5",
    "dotenv": "^16.3.1"
  }
}
```

### server.js

```javascript
const express = require('express');
const http = require('http');
const socketIO = require('socket.io');
const cors = require('cors');
const mysql = require('mysql2/promise');
require('dotenv').config();

const app = express();
const server = http.createServer(app);
const io = socketIO(server, {
  cors: {
    origin: 'http://localhost:4200',
    methods: ['GET', 'POST', 'PATCH', 'DELETE']
  }
});

// Middlewares
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// MySQL Connection Pool
const pool = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'conecta_ies',
  waitForConnections: true,
  connectionLimit: 10
});

// Tornar pool e io disponíveis globalmente
app.locals.db = pool;
app.locals.io = io;

// WebSocket
io.on('connection', (socket) => {
  console.log('Cliente conectado:', socket.id);
  
  socket.on('disconnect', () => {
    console.log('Cliente desconectado:', socket.id);
  });
});

// Routes
const solicitacaoRoutes = require('./routes/solicitacao.routes');
app.use('/api/solicitacoes', solicitacaoRoutes);

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
  console.log(`WebSocket disponível em ws://localhost:${PORT}`);
});
```

---

## 📁 Estrutura de Pastas Sugerida

```
backend/
├── server.js
├── package.json
├── .env
├── routes/
│   └── solicitacao.routes.js
├── controllers/
│   └── solicitacao.controller.js
├── services/
│   ├── solicitacao.service.js
│   └── websocket.service.js
├── middlewares/
│   └── auth.middleware.js
└── utils/
    ├── protocolo.generator.js
    └── tmr.calculator.js
```

---

## 🛣️ Routes (solicitacao.routes.js)

```javascript
const express = require('express');
const router = express.Router();
const multer = require('multer');
const solicitacaoController = require('../controllers/solicitacao.controller');
const authMiddleware = require('../middlewares/auth.middleware');

// Configurar multer para upload
const upload = multer({
  dest: 'uploads/',
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
  fileFilter: (req, file, cb) => {
    const allowedTypes = ['image/jpeg', 'image/png', 'application/pdf', 
                          'application/msword', 
                          'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Tipo de arquivo não permitido'));
    }
  }
});

// Rotas públicas (requer autenticação básica)
router.post('/', authMiddleware, upload.array('anexos', 3), solicitacaoController.criar);
router.get('/minhas', authMiddleware, solicitacaoController.listarMinhas);
router.get('/:id', authMiddleware, solicitacaoController.obter);
router.get('/:id/historico', authMiddleware, solicitacaoController.obterHistorico);
router.post('/:id/comentarios', authMiddleware, solicitacaoController.adicionarComentario);
router.patch('/:id/resolver', authMiddleware, solicitacaoController.marcarResolvida);

// Rotas Admin (requer perfil ADMIN)
router.get('/admin/novas', authMiddleware, solicitacaoController.listarNovas);
router.patch('/:id/atribuir', authMiddleware, solicitacaoController.atribuir);
router.post('/:id/primeira-resposta', authMiddleware, solicitacaoController.primeiraResposta);

module.exports = router;
```

---

## 🎮 Controller (solicitacao.controller.js)

```javascript
const solicitacaoService = require('../services/solicitacao.service');
const websocketService = require('../services/websocket.service');

class SolicitacaoController {
  
  async criar(req, res) {
    try {
      const { titulo, descricao, tipo } = req.body;
      const usuarioId = req.user.id; // Do middleware de autenticação
      const anexos = req.files || [];

      // Validações
      if (!titulo || !descricao || !tipo) {
        return res.status(400).json({ error: 'Campos obrigatórios faltando' });
      }

      if (anexos.length > 3) {
        return res.status(400).json({ error: 'Máximo de 3 anexos permitidos' });
      }

      // Criar solicitação
      const solicitacao = await solicitacaoService.criar({
        titulo,
        descricao,
        tipo,
        usuarioId,
        anexos
      }, req.app.locals.db);

      // Emitir WebSocket para admins
      websocketService.emitirNovaSolicitacao(req.app.locals.io, solicitacao);

      res.status(201).json(solicitacao);
    } catch (error) {
      console.error('Erro ao criar solicitação:', error);
      res.status(500).json({ error: 'Erro interno do servidor' });
    }
  }

  async listarMinhas(req, res) {
    try {
      const usuarioId = req.user.id;
      const solicitacoes = await solicitacaoService.listarPorUsuario(
        usuarioId, 
        req.app.locals.db
      );
      
      res.json(solicitacoes);
    } catch (error) {
      console.error('Erro ao listar solicitações:', error);
      res.status(500).json({ error: 'Erro interno do servidor' });
    }
  }

  async obter(req, res) {
    try {
      const { id } = req.params;
      const solicitacao = await solicitacaoService.obterPorId(id, req.app.locals.db);
      
      if (!solicitacao) {
        return res.status(404).json({ error: 'Solicitação não encontrada' });
      }

      res.json(solicitacao);
    } catch (error) {
      console.error('Erro ao obter solicitação:', error);
      res.status(500).json({ error: 'Erro interno do servidor' });
    }
  }

  async obterHistorico(req, res) {
    try {
      const { id } = req.params;
      const historico = await solicitacaoService.obterHistorico(id, req.app.locals.db);
      
      res.json(historico);
    } catch (error) {
      console.error('Erro ao obter histórico:', error);
      res.status(500).json({ error: 'Erro interno do servidor' });
    }
  }

  async adicionarComentario(req, res) {
    try {
      const { id } = req.params;
      const { comentario } = req.body;
      const usuarioId = req.user.id;

      if (!comentario) {
        return res.status(400).json({ error: 'Comentário é obrigatório' });
      }

      const evento = await solicitacaoService.adicionarComentario({
        solicitacaoId: id,
        comentario,
        usuarioId
      }, req.app.locals.db);

      // Emitir WebSocket
      websocketService.emitirAtualizacaoStatus(req.app.locals.io, {
        solicitacaoId: id,
        status: 'COMMENT_ADDED'
      });

      res.status(201).json(evento);
    } catch (error) {
      console.error('Erro ao adicionar comentário:', error);
      res.status(500).json({ error: 'Erro interno do servidor' });
    }
  }

  async marcarResolvida(req, res) {
    try {
      const { id } = req.params;
      const usuarioId = req.user.id;

      const solicitacao = await solicitacaoService.marcarResolvida({
        solicitacaoId: id,
        usuarioId
      }, req.app.locals.db);

      // Emitir WebSocket
      websocketService.emitirAtualizacaoStatus(req.app.locals.io, {
        solicitacaoId: id,
        status: 'RESOLVIDO'
      });

      res.json(solicitacao);
    } catch (error) {
      console.error('Erro ao marcar como resolvida:', error);
      res.status(500).json({ error: 'Erro interno do servidor' });
    }
  }

  async listarNovas(req, res) {
    try {
      // Apenas admins podem acessar
      if (req.user.tipoPerfil !== 'ADMIN') {
        return res.status(403).json({ error: 'Acesso negado' });
      }

      const solicitacoes = await solicitacaoService.listarNovas(req.app.locals.db);
      
      res.json(solicitacoes);
    } catch (error) {
      console.error('Erro ao listar novas solicitações:', error);
      res.status(500).json({ error: 'Erro interno do servidor' });
    }
  }

  async atribuir(req, res) {
    try {
      if (req.user.tipoPerfil !== 'ADMIN') {
        return res.status(403).json({ error: 'Acesso negado' });
      }

      const { id } = req.params;
      const { usuarioId, nota } = req.body;

      const solicitacao = await solicitacaoService.atribuir({
        solicitacaoId: id,
        usuarioId,
        nota,
        adminId: req.user.id
      }, req.app.locals.db);

      websocketService.emitirAtualizacaoStatus(req.app.locals.io, {
        solicitacaoId: id,
        status: 'EM_ANALISE'
      });

      res.json(solicitacao);
    } catch (error) {
      console.error('Erro ao atribuir solicitação:', error);
      res.status(500).json({ error: 'Erro interno do servidor' });
    }
  }

  async primeiraResposta(req, res) {
    try {
      if (req.user.tipoPerfil !== 'ADMIN') {
        return res.status(403).json({ error: 'Acesso negado' });
      }

      const { id } = req.params;
      const { resposta } = req.body;

      if (!resposta) {
        return res.status(400).json({ error: 'Resposta é obrigatória' });
      }

      // ⚠️ CRÍTICO: Atualizar first_response_at
      const solicitacao = await solicitacaoService.primeiraResposta({
        solicitacaoId: id,
        resposta,
        adminId: req.user.id
      }, req.app.locals.db);

      websocketService.emitirAtualizacaoStatus(req.app.locals.io, {
        solicitacaoId: id,
        status: 'EM_EXECUCAO'
      });

      res.json(solicitacao);
    } catch (error) {
      console.error('Erro ao enviar primeira resposta:', error);
      res.status(500).json({ error: 'Erro interno do servidor' });
    }
  }
}

module.exports = new SolicitacaoController();
```

---

## 🔨 Service (solicitacao.service.js)

```javascript
const protocoloGenerator = require('../utils/protocolo.generator');
const tmrCalculator = require('../utils/tmr.calculator');

class SolicitacaoService {

  async criar({ titulo, descricao, tipo, usuarioId, anexos }, db) {
    const connection = await db.getConnection();
    
    try {
      await connection.beginTransaction();

      // Gerar protocolo único
      const protocolo = await protocoloGenerator.gerar(connection);

      // Inserir solicitação
      const [result] = await connection.execute(
        `INSERT INTO solicitations (protocolo, titulo, descricao, tipo, usuario_id, status) 
         VALUES (?, ?, ?, ?, ?, 'ABERTO')`,
        [protocolo, titulo, descricao, tipo, usuarioId]
      );

      const solicitacaoId = result.insertId;

      // Processar anexos (se houver)
      const anexosProcessados = [];
      for (const file of anexos) {
        // Aqui você salvaria o arquivo e pegaria a URL
        const url = await this.salvarAnexo(file);
        
        await connection.execute(
          `INSERT INTO attachments (solicitacao_id, nome, url, tipo) VALUES (?, ?, ?, ?)`,
          [solicitacaoId, file.originalname, url, file.mimetype]
        );

        anexosProcessados.push({
          id: result.insertId,
          nome: file.originalname,
          url: url,
          tipo: file.mimetype
        });
      }

      // Criar evento inicial no histórico
      await connection.execute(
        `INSERT INTO event_history (solicitacao_id, evento_tipo, descricao, usuario_id) 
         VALUES (?, 'STATUS_CHANGE', 'Solicitação criada', ?)`,
        [solicitacaoId, usuarioId]
      );

      await connection.commit();

      // Buscar usuário para incluir nome
      const [users] = await connection.execute(
        'SELECT nome FROM users WHERE id = ?',
        [usuarioId]
      );

      // Retornar objeto completo
      return {
        id: solicitacaoId,
        protocolo,
        titulo,
        descricao,
        tipo,
        status: 'ABERTO',
        usuarioId,
        usuarioNome: users[0].nome,
        anexos: anexosProcessados,
        createdAt: new Date(),
        updatedAt: new Date(),
        firstResponseAt: null,
        timeToTmrBreach: 14400 // 4 horas em segundos
      };
      
    } catch (error) {
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }
  }

  async listarPorUsuario(usuarioId, db) {
    const [rows] = await db.execute(
      `SELECT s.*, u.nome as usuarioNome 
       FROM solicitations s 
       LEFT JOIN users u ON s.usuario_id = u.id 
       WHERE s.usuario_id = ? 
       ORDER BY s.created_at DESC`,
      [usuarioId]
    );

    return rows.map(row => this.formatarSolicitacao(row));
  }

  async obterPorId(id, db) {
    const [rows] = await db.execute(
      `SELECT s.*, u.nome as usuarioNome 
       FROM solicitations s 
       LEFT JOIN users u ON s.usuario_id = u.id 
       WHERE s.id = ?`,
      [id]
    );

    if (rows.length === 0) return null;

    const solicitacao = this.formatarSolicitacao(rows[0]);

    // Buscar anexos
    const [anexos] = await db.execute(
      'SELECT id, nome, url, tipo FROM attachments WHERE solicitacao_id = ?',
      [id]
    );

    solicitacao.anexos = anexos;

    return solicitacao;
  }

  async obterHistorico(solicitacaoId, db) {
    const [rows] = await db.execute(
      `SELECT eh.*, u.nome as usuarioNome 
       FROM event_history eh 
       LEFT JOIN users u ON eh.usuario_id = u.id 
       WHERE eh.solicitacao_id = ? 
       ORDER BY eh.timestamp ASC`,
      [solicitacaoId]
    );

    return rows.map(row => ({
      id: row.id,
      solicitacaoId: row.solicitacao_id,
      eventoTipo: row.evento_tipo,
      descricao: row.descricao,
      usuarioId: row.usuario_id,
      usuarioNome: row.usuarioNome,
      timestamp: row.timestamp
    }));
  }

  async adicionarComentario({ solicitacaoId, comentario, usuarioId }, db) {
    const [result] = await db.execute(
      `INSERT INTO event_history (solicitacao_id, evento_tipo, descricao, usuario_id) 
       VALUES (?, 'COMMENT', ?, ?)`,
      [solicitacaoId, comentario, usuarioId]
    );

    const [users] = await db.execute('SELECT nome FROM users WHERE id = ?', [usuarioId]);

    return {
      id: result.insertId,
      solicitacaoId,
      eventoTipo: 'COMMENT',
      descricao: comentario,
      usuarioId,
      usuarioNome: users[0].nome,
      timestamp: new Date()
    };
  }

  async marcarResolvida({ solicitacaoId, usuarioId }, db) {
    const connection = await db.getConnection();
    
    try {
      await connection.beginTransaction();

      await connection.execute(
        `UPDATE solicitations SET status = 'RESOLVIDO', updated_at = NOW() WHERE id = ?`,
        [solicitacaoId]
      );

      await connection.execute(
        `INSERT INTO event_history (solicitacao_id, evento_tipo, descricao, usuario_id) 
         VALUES (?, 'STATUS_CHANGE', 'Solicitação marcada como resolvida', ?)`,
        [solicitacaoId, usuarioId]
      );

      await connection.commit();

      return await this.obterPorId(solicitacaoId, db);
      
    } catch (error) {
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }
  }

  async listarNovas(db) {
    const [rows] = await db.execute(
      `SELECT s.*, u.nome as usuarioNome 
       FROM solicitations s 
       LEFT JOIN users u ON s.usuario_id = u.id 
       WHERE s.status IN ('ABERTO', 'NAO_VISTO', 'EM_ANALISE', 'EM_EXECUCAO') 
       ORDER BY s.created_at DESC`
    );

    return rows.map(row => this.formatarSolicitacao(row));
  }

  async atribuir({ solicitacaoId, usuarioId, nota, adminId }, db) {
    const connection = await db.getConnection();
    
    try {
      await connection.beginTransaction();

      await connection.execute(
        `UPDATE solicitations SET status = 'EM_ANALISE', updated_at = NOW() WHERE id = ?`,
        [solicitacaoId]
      );

      await connection.execute(
        `INSERT INTO event_history (solicitacao_id, evento_tipo, descricao, usuario_id) 
         VALUES (?, 'STATUS_CHANGE', ?, ?)`,
        [solicitacaoId, `Atribuído: ${nota}`, adminId]
      );

      await connection.commit();

      return await this.obterPorId(solicitacaoId, db);
      
    } catch (error) {
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }
  }

  async primeiraResposta({ solicitacaoId, resposta, adminId }, db) {
    const connection = await db.getConnection();
    
    try {
      await connection.beginTransaction();

      // ⚠️ CRÍTICO: Atualizar first_response_at
      await connection.execute(
        `UPDATE solicitations 
         SET status = 'EM_EXECUCAO', 
             first_response_at = NOW(), 
             updated_at = NOW() 
         WHERE id = ?`,
        [solicitacaoId]
      );

      await connection.execute(
        `INSERT INTO event_history (solicitacao_id, evento_tipo, descricao, usuario_id) 
         VALUES (?, 'COMMENT', ?, ?)`,
        [solicitacaoId, `Primeira resposta: ${resposta}`, adminId]
      );

      await connection.commit();

      return await this.obterPorId(solicitacaoId, db);
      
    } catch (error) {
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }
  }

  formatarSolicitacao(row) {
    return {
      id: row.id,
      protocolo: row.protocolo,
      titulo: row.titulo,
      descricao: row.descricao,
      tipo: row.tipo,
      status: row.status,
      usuarioId: row.usuario_id,
      usuarioNome: row.usuarioNome,
      anexos: [],
      createdAt: row.created_at,
      updatedAt: row.updated_at,
      firstResponseAt: row.first_response_at,
      timeToTmrBreach: tmrCalculator.calcular(row.created_at, row.first_response_at)
    };
  }

  async salvarAnexo(file) {
    // Implementar upload para S3, Google Cloud Storage ou servidor local
    // Por enquanto, retornar URL fictícia
    return `http://localhost:3000/uploads/${file.filename}`;
  }
}

module.exports = new SolicitacaoService();
```

---

## 🧮 Utils

### protocolo.generator.js

```javascript
class ProtocoloGenerator {
  async gerar(connection) {
    const ano = new Date().getFullYear();
    
    const [rows] = await connection.execute(
      'SELECT COUNT(*) as total FROM solicitations WHERE YEAR(created_at) = ?',
      [ano]
    );
    
    const sequencial = String(rows[0].total + 1).padStart(4, '0');
    
    return `SOL-${ano}-${sequencial}`;
  }
}

module.exports = new ProtocoloGenerator();
```

### tmr.calculator.js

```javascript
class TmrCalculator {
  calcular(createdAt, firstResponseAt) {
    // Se já teve primeira resposta, retorna null
    if (firstResponseAt) {
      return null;
    }
    
    const TMR_LIMIT = 4 * 60 * 60; // 4 horas em segundos
    const elapsed = (Date.now() - new Date(createdAt).getTime()) / 1000;
    const remaining = TMR_LIMIT - elapsed;
    
    return remaining > 0 ? Math.floor(remaining) : 0;
  }
}

module.exports = new TmrCalculator();
```

---

## 📡 WebSocket Service (websocket.service.js)

```javascript
class WebsocketService {
  
  emitirNovaSolicitacao(io, solicitacao) {
    io.emit('nova-solicitacao', solicitacao);
    console.log('WebSocket: nova-solicitacao emitido', solicitacao.id);
  }

  emitirAtualizacaoStatus(io, { solicitacaoId, status }) {
    const payload = {
      solicitacaoId,
      status,
      timestamp: new Date()
    };
    
    io.emit('atualizacao-status', payload);
    console.log('WebSocket: atualizacao-status emitido', payload);
  }
}

module.exports = new WebsocketService();
```

---

## 🔐 Auth Middleware (auth.middleware.js)

```javascript
const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || 'seu-secret-aqui';

async function authMiddleware(req, res, next) {
  try {
    const token = req.headers.authorization?.replace('Bearer ', '');
    
    if (!token) {
      return res.status(401).json({ error: 'Token não fornecido' });
    }

    const decoded = jwt.verify(token, JWT_SECRET);
    
    // Buscar usuário no banco
    const [users] = await req.app.locals.db.execute(
      'SELECT id, nome, email, tipo_perfil FROM users WHERE id = ?',
      [decoded.userId]
    );

    if (users.length === 0) {
      return res.status(401).json({ error: 'Usuário não encontrado' });
    }

    req.user = {
      id: users[0].id,
      nome: users[0].nome,
      email: users[0].email,
      tipoPerfil: users[0].tipo_perfil
    };

    next();
  } catch (error) {
    console.error('Erro na autenticação:', error);
    res.status(401).json({ error: 'Token inválido' });
  }
}

module.exports = authMiddleware;
```

---

## 📝 .env

```env
# Servidor
PORT=3000

# MySQL
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=sua-senha
DB_NAME=conecta_ies

# JWT
JWT_SECRET=seu-secret-super-seguro-aqui

# Redis (opcional)
REDIS_HOST=localhost
REDIS_PORT=6379
```

---

## 🗃️ Schema SQL Completo

```sql
CREATE DATABASE conecta_ies CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

USE conecta_ies;

-- Tabela de usuários
CREATE TABLE users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  nome VARCHAR(200) NOT NULL,
  email VARCHAR(200) NOT NULL UNIQUE,
  senha_hash VARCHAR(255) NOT NULL,
  tipo_perfil ENUM('ALUNO', 'PROFESSOR', 'ADMIN') NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_email (email),
  INDEX idx_tipo_perfil (tipo_perfil)
) ENGINE=InnoDB;

-- Tabela de solicitações
CREATE TABLE solicitations (
  id INT AUTO_INCREMENT PRIMARY KEY,
  protocolo VARCHAR(50) NOT NULL UNIQUE,
  titulo VARCHAR(200) NOT NULL,
  descricao TEXT NOT NULL,
  tipo ENUM('APOIO_LOCOMOCAO', 'INTERPRETACAO_LIBRAS', 'OUTROS') NOT NULL,
  status ENUM('ABERTO', 'NAO_VISTO', 'EM_ANALISE', 'EM_EXECUCAO', 'RESOLVIDO') DEFAULT 'ABERTO',
  usuario_id INT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  first_response_at TIMESTAMP NULL,
  FOREIGN KEY (usuario_id) REFERENCES users(id) ON DELETE CASCADE,
  INDEX idx_usuario (usuario_id),
  INDEX idx_status (status),
  INDEX idx_created_at (created_at),
  INDEX idx_first_response (first_response_at)
) ENGINE=InnoDB;

-- Tabela de anexos
CREATE TABLE attachments (
  id INT AUTO_INCREMENT PRIMARY KEY,
  solicitacao_id INT NOT NULL,
  nome VARCHAR(255) NOT NULL,
  url VARCHAR(500) NOT NULL,
  tipo VARCHAR(100) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (solicitacao_id) REFERENCES solicitations(id) ON DELETE CASCADE,
  INDEX idx_solicitacao (solicitacao_id)
) ENGINE=InnoDB;

-- Tabela de histórico de eventos
CREATE TABLE event_history (
  id INT AUTO_INCREMENT PRIMARY KEY,
  solicitacao_id INT NOT NULL,
  evento_tipo ENUM('STATUS_CHANGE', 'COMMENT', 'ATTACHMENT') NOT NULL,
  descricao TEXT NOT NULL,
  usuario_id INT NULL,
  timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (solicitacao_id) REFERENCES solicitations(id) ON DELETE CASCADE,
  FOREIGN KEY (usuario_id) REFERENCES users(id) ON DELETE SET NULL,
  INDEX idx_solicitacao (solicitacao_id),
  INDEX idx_timestamp (timestamp)
) ENGINE=InnoDB;

-- Dados de teste
INSERT INTO users (nome, email, senha_hash, tipo_perfil) VALUES
('Admin Sistema', 'admin@conectaies.com', '$2b$10$...', 'ADMIN'),
('João Silva', 'joao@aluno.com', '$2b$10$...', 'ALUNO'),
('Maria Santos', 'maria@professor.com', '$2b$10$...', 'PROFESSOR');
```

---

## ✅ Checklist Rápido

- [ ] Instalar dependências: `npm install`
- [ ] Criar banco MySQL e executar schema
- [ ] Configurar `.env` com credenciais
- [ ] Testar conexão MySQL
- [ ] Implementar autenticação JWT
- [ ] Testar endpoint POST `/api/solicitacoes`
- [ ] Testar WebSocket com front-end
- [ ] Verificar cálculo de `timeToTmrBreach`
- [ ] Testar primeira resposta e atualização de `first_response_at`
- [ ] Validar histórico de eventos

---

**Este código está 100% alinhado com o front-end implementado!**
