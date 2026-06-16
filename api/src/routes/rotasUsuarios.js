import { Router } from "express";
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
import { BD } from '../../db.js';
import { verificarToken } from '../../autenticacao.js'; 

dotenv.config();

const router = Router();
const JWT_SECRET = process.env.JWT_SECRET || 'sua_chave_secreta_padrao';

// ==========================================
// 📌 1. AUTENTICAR (LOGIN) -> URL: POST /auth/login
// ==========================================
router.post('/auth/login', async (req, res) => {
    const { email, senha, tipo_usuario } = req.body;

    if (!email || !senha || !tipo_usuario) {
        return res.status(400).json({ 
            error: "ValidationError",
            message: "Por favor, preencha o e-mail, a senha e selecione o tipo de usuário." 
        });
    }

    try {
        const { rows, rowCount } = await BD.query(
            `SELECT id, email, tipo_usuario, senha
             FROM usuarios 
             WHERE email = $1 AND tipo_usuario = $2`,
            [email, tipo_usuario]
        );

        if (rowCount === 0) {
            return res.status(401).json({ 
                message: "E-mail ou tipo de usuário incorretos." 
            });
        }

        const usuario = rows[0];

        if (usuario.senha !== senha) {
            return res.status(401).json({ 
                message: "Senha incorreta. Tente novamente." 
            });
        }

        const token = jwt.sign(
            { id: usuario.id, email: usuario.email, tipo_usuario: usuario.tipo_usuario },
            JWT_SECRET,
            { expiresIn: '1d' }
        );

        return res.status(200).json({
            message: "Autenticação efetuada com sucesso.",
            usuario: { id: usuario.id, email: usuario.email, tipo_usuario: usuario.tipo_usuario },
            token
        });

    } catch (error) {
        console.error("ERRO CRÍTICO NO LOGIN:", error.message);
        return res.status(500).json({ error: error.message });
    }
});

// ==========================================
// 📌 2. LISTAR USUÁRIOS -> URL: GET /usuarios
// ==========================================
router.get('/usuarios', verificarToken, async (req, res) => {
    try {
        const { rows } = await BD.query(
            `SELECT id, email, tipo_usuario FROM usuarios ORDER BY email ASC`
        );
        return res.status(200).json(rows);
    } catch (error) {
        console.error("ERRO AO LISTAR:", error.message);
        return res.status(500).json({ error: error.message });
    }
});

// ==========================================
// 📌 3. CADASTRO -> URL: POST /usuarios
// ==========================================
router.post('/usuarios', async (req, res) => {
    const { email, senha, tipo_usuario } = req.body;

    if (!email || !senha || !tipo_usuario) {
        return res.status(400).json({ message: "Preencha todos os campos obrigatórios." });
    }

    try {
        const { rows } = await BD.query(`
            INSERT INTO usuarios (email, senha, tipo_usuario) 
            VALUES ($1, $2, $3) 
            RETURNING id, email, tipo_usuario
        `, [email, senha, tipo_usuario]);

        return res.status(201).json({
            message: "Registro de usuário realizado com sucesso.",
            usuario: rows[0]
        });

    } catch (error) {
        if (error.code === '23505') {
            return res.status(400).json({ message: "Este e-mail já está cadastrado." });
        }
        console.error("ERRO AO CADASTRAR:", error.message);
        return res.status(500).json({ error: error.message });
    }
});

// ==========================================
// 📌 4. UPDATE -> URL: PUT /usuarios/:id
// ==========================================
router.put('/usuarios/:id', verificarToken, async (req, res) => {
    const { id } = req.params;
    const { email, senha, tipo_usuario } = req.body;

    try {
        const { rows, rowCount } = await BD.query(`
            UPDATE usuarios 
            SET email=$1, senha=$2, tipo_usuario=$3
            WHERE id=$4
            RETURNING id, email, tipo_usuario
        `, [email, senha, tipo_usuario, id]);

        if (rowCount === 0) {
            return res.status(404).json({ message: "Usuário não encontrado." });
        }

        return res.status(200).json({ message: "Dados atualizados.", usuario: rows[0] });

    } catch (error) {
        console.error("ERRO NO UPDATE:", error.message);
        return res.status(500).json({ error: error.message });
    }
});

// ==========================================
// 📌 5. DELETE -> URL: DELETE /usuarios/:id
// ==========================================
router.delete('/usuarios/:id', verificarToken, async (req, res) => {
    const { id } = req.params;

    try {
        const { rowCount } = await BD.query(`DELETE FROM usuarios WHERE id=$1`, [id]);

        if (rowCount === 0) {
            return res.status(404).json({ message: "Usuário não encontrado." });
        }

        return res.status(200).json({ message: "Usuário excluído permanentemente." });

    } catch (error) {
        console.error("ERRO NO DELETE:", error.message);
        return res.status(500).json({ error: error.message });
    }
});

export default router;