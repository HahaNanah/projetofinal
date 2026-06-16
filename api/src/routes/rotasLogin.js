const express = require('express');
const router = express.Router();
const db = require('../db');
const jwt = require('jsonwebtoken');

const SECRET = 'seu_segredo_aqui';

// ==============================
// 🔐 AUTH - LOGIN
// ==============================
router.post('/auth/login', async (req, res) => {
  const { email, senha, tipo_usuario } = req.body; // 💡 Incluído tipo_usuario para bater com a tabela

  if (!email || !senha || !tipo_usuario) {
    return res.status(400).json({ erro: 'Email, senha e tipo de usuário são obrigatórios' });
  }

  try {
    // 💡 Busca validando email E tipo_usuario conforme regras do seu banco
    const [rows] = await db.query(
      'SELECT * FROM Login WHERE email = ? AND tipo_usuario = ?',
      [email, tipo_usuario]
    );

    if (rows.length === 0) {
      return res.status(401).json({ erro: 'Usuário não encontrado ou tipo incorreto' });
    }

    const usuario = rows[0];

    if (usuario.senha !== senha) {
      return res.status(401).json({ erro: 'Senha inválida' });
    }

    // 💡 Agora injetamos o id, email E tipo_usuario no Token para a rota /perfil usar depois!
    const token = jwt.sign(
      { 
        id: usuario.id,
        email: usuario.email,
        tipo_usuario: usuario.tipo_usuario 
      },
      SECRET,
      { expiresIn: '1d' }
    );

    res.json({
      mensagem: 'Login realizado com sucesso',
      token,
      usuario: {
        id: usuario.id,
        email: usuario.email,
        tipo_usuario: usuario.tipo_usuario
      }
    });

  } catch (err) {
    console.error("Erro no Login Auth:", err.message); // 💡 Printa o erro real no console do VSCode
    res.status(500).json({ erro: 'Erro interno ao tentar autenticar.' });
  }
});


// ==============================
// 👤 USUÁRIOS - CRUD
// ==============================

// 🔎 LISTAR
router.get('/usuarios', async (req, res) => {
  try {
    const [rows] = await db.query('SELECT id, email, tipo_usuario FROM Login'); // 💡 Removido 'nome' que não existe nesta tabela
    res.json(rows);
  } catch (err) {
    console.error("Erro ao listar usuários:", err.message);
    res.status(500).json({ erro: 'Erro ao buscar lista de usuários.' });
  }
});


// ➕ CRIAR USUÁRIO
router.post('/usuarios', async (req, res) => {
  const { email, senha, tipo_usuario } = req.body; // 💡 'nome' removido daqui pois pertence ao Perfil

  if (!email || !senha || !tipo_usuario) {
    return res.status(400).json({ erro: 'Email, senha e tipo_usuario são obrigatórios' });
  }

  try {
    const [existe] = await db.query(
      'SELECT id FROM Login WHERE email = ?',
      [email]
    );

    if (existe.length > 0) {
      return res.status(400).json({ erro: 'Email já cadastrado' });
    }

    // 💡 Agora salvando o tipo_usuario que o banco exige como NOT NULL
    const [result] = await db.query(
      'INSERT INTO Login (email, senha, tipo_usuario) VALUES (?, ?, ?)',
      [email, senha, tipo_usuario]
    );

    res.status(201).json({
      mensagem: 'Usuário criado com sucesso',
      usuario: {
        id: result.insertId,
        email,
        tipo_usuario
      }
    });

  } catch (err) {
    console.error("Erro ao criar usuário:", err.message);
    res.status(500).json({ erro: 'Erro interno ao salvar o usuário no banco de dados.' });
  }
});


// ✏️ ATUALIZAR
router.put('/usuarios/:id', async (req, res) => {
  const { id } = req.params;
  const { email, senha, tipo_usuario } = req.body;

  if (!email || !senha || !tipo_usuario) {
    return res.status(400).json({ erro: 'Todos os campos são obrigatórios' });
  }

  try {
    // 💡 Atualizando incluindo o tipo_usuario obrigatório
    const [result] = await db.query(
      'UPDATE Login SET email=?, senha=?, tipo_usuario=? WHERE id=?',
      [email, senha, tipo_usuario, id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ erro: 'Usuário não encontrado' });
    }

    res.json({ mensagem: 'Usuário atualizado com sucesso' });

  } catch (err) {
    console.error("Erro ao atualizar usuário:", err.message);
    res.status(500).json({ erro: 'Erro interno ao atualizar os dados.' });
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
    console.error("Erro ao deletar usuário:", err.message);
    res.status(500).json({ erro: 'Erro interno ao deletar o usuário.' });
  }
});

module.exports = router;