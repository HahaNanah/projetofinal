const express = require('express');
const router = express.Router();
const db = require('../db');
const jwt = require('jsonwebtoken');

const SECRET = 'seu_segredo_aqui';

// ==============================
// 🔐 AUTH - LOGIN
// ==============================
router.post('/auth/login', async (req, res) => {
  const { email, senha } = req.body;

  // 🔎 Validação básica
  if (!email || !senha) {
    return res.status(400).json({ erro: 'Email e senha são obrigatórios' });
  }

  try {
    const [rows] = await db.query(
      'SELECT * FROM Login WHERE email = ?',
      [email]
    );

    if (rows.length === 0) {
      return res.status(401).json({ erro: 'Usuário não encontrado' });
    }

    const usuario = rows[0];

    // ⚠️ Comparação simples (depois trocar por bcrypt)
    if (usuario.senha !== senha) {
      return res.status(401).json({ erro: 'Senha inválida' });
    }

    const token = jwt.sign(
      { id: usuario.id },
      SECRET,
      { expiresIn: '1d' }
    );

    // ✅ RETORNANDO USUÁRIO (IMPORTANTE PRA /perfil)
    res.json({
      mensagem: 'Login realizado com sucesso',
      token,
      usuario: {
        id: usuario.id,
        nome: usuario.nome,
        email: usuario.email
      }
    });

  } catch (err) {
    res.status(500).json({ erro: err.message });
  }
});


// ==============================
// 👤 USUÁRIOS - CRUD
// ==============================

// 🔎 LISTAR
router.get('/usuarios', async (req, res) => {
  try {
    const [rows] = await db.query('SELECT id, nome, email FROM Login');
    res.json(rows);
  } catch (err) {
    res.status(500).json({ erro: err.message });
  }
});


// ➕ CRIAR USUÁRIO
router.post('/usuarios', async (req, res) => {
  const { nome, email, senha } = req.body;

  if (!nome || !email || !senha) {
    return res.status(400).json({ erro: 'Todos os campos são obrigatórios' });
  }

  try {
    // 🔒 Verifica email duplicado
    const [existe] = await db.query(
      'SELECT id FROM Login WHERE email = ?',
      [email]
    );

    if (existe.length > 0) {
      return res.status(400).json({ erro: 'Email já cadastrado' });
    }

    const [result] = await db.query(
      'INSERT INTO Login (nome, email, senha) VALUES (?, ?, ?)',
      [nome, email, senha]
    );

    res.status(201).json({
      mensagem: 'Usuário criado com sucesso',
      usuario: {
        id: result.insertId,
        nome,
        email
      }
    });

  } catch (err) {
    res.status(500).json({ erro: err.message });
  }
});


// ✏️ ATUALIZAR
router.put('/usuarios/:id', async (req, res) => {
  const { id } = req.params;
  const { nome, email, senha } = req.body;

  if (!nome || !email || !senha) {
    return res.status(400).json({ erro: 'Todos os campos são obrigatórios' });
  }

  try {
    const [result] = await db.query(
      'UPDATE Login SET nome=?, email=?, senha=? WHERE id=?',
      [nome, email, senha, id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ erro: 'Usuário não encontrado' });
    }

    res.json({ mensagem: 'Usuário atualizado com sucesso' });

  } catch (err) {
    res.status(500).json({ erro: err.message });
  }
});


// ❌ DELETAR
router.delete('/usuarios/:id', async (req, res) => {
  const { id } = req.params;

  try {
    const [result] = await db.query(
      'DELETE FROM Login WHERE id=?',
      [id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ erro: 'Usuário não encontrado' });
    }

    res.json({ mensagem: 'Usuário deletado com sucesso' });

  } catch (err) {
    res.status(500).json({ erro: err.message });
  }
});


module.exports = router;