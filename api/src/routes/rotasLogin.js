import { Router } from "express";
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
import { BD } from '../../db.js';
import { verificarToken } from '../../autenticacao.js'; 

dotenv.config();

const router = Router();
const JWT_SECRET = process.env.JWT_SECRET || 'sua_chave_secreta_padrao';

// 📌 1. LISTAR LOGINS (PROTEGIDA com o seu verificarToken)
router.get('/login', verificarToken, async (req, res) => {
    try {
        const { rows } = await BD.query(
            `SELECT id, email, tipo_usuario 
             FROM Login 
             ORDER BY email ASC`
        );
        return res.status(200).json(rows);
    } catch (error) {
        console.error('Erro ao listar logins no banco:', error.message);
        return res.status(500).json({ message: 'Erro ao listar login' });
    }
});

// 📌 2. AUTENTICAR USUÁRIO (PÚBLICA - Gera o token)
router.post('/login/auth', async (req, res) => {
    const { email, senha, tipo_usuario } = req.body;

    if (!email || !senha || !tipo_usuario) {
        return res.status(400).json({ message: "Por favor, preencha todos os campos." });
    }

    try {
        const { rows, rowCount } = await BD.query(
            `SELECT id, email, tipo_usuario 
             FROM Login 
             WHERE email = $1 AND senha = $2 AND tipo_usuario = $3`,
            [email, senha, tipo_usuario]
        );

        if (rowCount === 0) {
            return res.status(401).json({ message: "E-mail, senha ou tipo de usuário incorretos." });
        }

        // 🔑 Gerar JWT Token
        const usuario = rows[0];
        const token = jwt.sign(
            {
                id: usuario.id,
                email: usuario.email,
                tipo_usuario: usuario.tipo_usuario
            },
            JWT_SECRET
        );

        return res.status(200).json({
            message: "Login efetuado com sucesso!",
            usuario: usuario,
            token: token
        });

    } catch (error) {
        console.error('Erro ao autenticar usuário (Login):', error.message);
        return res.status(500).json({ message: 'Erro interno ao tentar logar.' });
    }
});

// 📌 3. CADASTRAR NOVO USUÁRIO (PÚBLICA)
router.post('/login', async (req, res) => {
    const { email, senha, tipo_usuario } = req.body;

    if (!email || !senha || !tipo_usuario) {
        return res.status(400).json({ 
            message: "Campos obrigatórios: email, senha e tipo_usuario" 
        });
    }

    if (tipo_usuario !== 'vendedor' && tipo_usuario !== 'comprador') {
        return res.status(400).json({ 
            message: "O campo 'tipo_usuario' deve ser 'vendedor' ou 'comprador'" 
        });
    }

    try {
        const { rows } = await BD.query(`
            INSERT INTO Login (email, senha, tipo_usuario) 
            VALUES ($1, $2, $3) 
            RETURNING id, email, tipo_usuario
        `, [email, senha, tipo_usuario]);

        return res.status(201).json({
            message: "Cadastro feito com sucesso!",
            usuario: rows[0]
        });

    } catch (error) {
        if (error.code === '23505') { 
            console.warn(`[Cadastro Negado]: O e-mail "${email}" já existe.`);
            return res.status(400).json({ message: 'Este e-mail já está cadastrado.' });
        }
        
        console.error('Erro crítico ao realizar cadastro:', error.message);
        return res.status(500).json({ message: 'Erro ao criar login' });
    }
});

// 📌 4. ATUALIZAR CADASTRO (PROTEGIDA com o seu verificarToken)
router.put('/login/:id', verificarToken, async (req, res) => {
    const { id } = req.params;
    const { email, senha, tipo_usuario } = req.body;

    if (!email || !senha || !tipo_usuario) {
        return res.status(400).json({ message: "Campos obrigatórios para atualização completa." });
    }

    try {
        const { rows, rowCount } = await BD.query(`
            UPDATE Login 
            SET email = $1, senha = $2, tipo_usuario = $3
            WHERE id = $4
            RETURNING id, email, tipo_usuario
        `, [email, senha, tipo_usuario, id]);

        if (rowCount === 0) {
            return res.status(404).json({ message: "Login não encontrado" });
        }

        return res.status(200).json({ message: "Login atualizado com sucesso!", usuario: rows[0] });
    } catch (error) {
        console.error('Erro ao atualizar o cadastro:', error.message);
        return res.status(500).json({ message: 'Erro ao atualizar login' });
    }
});

// 📌 5. DELETAR CADASTRO (PROTEGIDA com o seu verificarToken)
router.delete('/login/:id', verificarToken, async (req, res) => {
    const { id } = req.params;
    try {
        const { rowCount } = await BD.query(`DELETE FROM Login WHERE id = $1`, [id]);
        if (rowCount === 0) {
            return res.status(404).json({ message: "Login não encontrado" });
        }
        return res.status(200).json({ message: "Login removido com sucesso!" });
    } catch (error) {
        console.error('Erro ao deletar login do banco:', error.message);
        return res.status(500).json({ message: 'Erro ao deletar login' });
    }
});

export default router;