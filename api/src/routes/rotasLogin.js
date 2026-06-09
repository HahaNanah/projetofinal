import { Router } from "express";
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
import { BD } from '../../db.js';
import { verificarToken } from '../../autenticacao.js'; 

dotenv.config();

const router = Router();
const JWT_SECRET = process.env.JWT_SECRET || 'sua_chave_secreta_padrao';


// 📌 LISTAR
router.get('/login', verificarToken, async (req, res) => {
    try {
        const { rows } = await BD.query(
            `SELECT id, email, tipo_usuario 
             FROM login 
             ORDER BY email ASC`
        );
        res.json(rows);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Erro ao listar login' });
    }
});


// 📌 LOGIN (AUTENTICAR)
router.post('/login/auth', async (req, res) => {
    const { email, senha, tipo_usuario } = req.body;

    if (!email || !senha || !tipo_usuario) {
        return res.status(400).json({ message: "Preencha todos os campos" });
    }

    try {
        const { rows, rowCount } = await BD.query(
            `SELECT id, email, tipo_usuario, senha
             FROM login 
             WHERE email = $1 AND tipo_usuario = $2`,
            [email, tipo_usuario]
        );

        if (rowCount === 0) {
            return res.status(401).json({ message: "Usuário não encontrado" });
        }

        const usuario = rows[0];

        if (usuario.senha !== senha) {
            return res.status(401).json({ message: "Senha incorreta" });
        }

        const token = jwt.sign(
            {
                id: usuario.id,
                email: usuario.email,
                tipo_usuario: usuario.tipo_usuario
            },
            JWT_SECRET
        );

        res.json({
            message: "Login realizado com sucesso",
            usuario,
            token
        });

    } catch (error) {
        console.error("ERRO LOGIN:", error);

        res.status(500).json({
            message: "Erro ao logar",
            erro: error.message
        });
    }
});


// 📌 CADASTRO
router.post('/login', async (req, res) => {
    const { email, senha, tipo_usuario } = req.body;

    if (!email || !senha || !tipo_usuario) {
        return res.status(400).json({
            message: "Campos obrigatórios: email, senha, tipo_usuario"
        });
    }

    try {
        const { rows } = await BD.query(`
            INSERT INTO login (email, senha, tipo_usuario) 
            VALUES ($1, $2, $3) 
            RETURNING id, email, tipo_usuario
        `, [email, senha, tipo_usuario]);

        res.status(201).json({
            message: "Cadastro realizado",
            usuario: rows[0]
        });

    } catch (error) {

        if (error.code === '23505') {
            return res.status(400).json({ message: 'Email já existe' });
        }

        console.error("ERRO CADASTRO:", error);

        res.status(500).json({
            message: "Erro ao criar login",
            erro: error.message
        });
    }
});


// 📌 UPDATE
router.put('/login/:id', verificarToken, async (req, res) => {
    const { id } = req.params;
    const { email, senha, tipo_usuario } = req.body;

    try {
        const { rows, rowCount } = await BD.query(`
            UPDATE login 
            SET email=$1, senha=$2, tipo_usuario=$3
            WHERE id=$4
            RETURNING id, email, tipo_usuario
        `, [email, senha, tipo_usuario, id]);

        if (rowCount === 0) {
            return res.status(404).json({ message: "Não encontrado" });
        }

        res.json({ message: "Atualizado", usuario: rows[0] });

    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Erro ao atualizar" });
    }
});


// 📌 DELETE
router.delete('/login/:id', verificarToken, async (req, res) => {
    const { id } = req.params;

    try {
        const { rowCount } = await BD.query(
            `DELETE FROM login WHERE id=$1`,
            [id]
        );

        if (rowCount === 0) {
            return res.status(404).json({ message: "Não encontrado" });
        }

        res.json({ message: "Deletado com sucesso" });

    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Erro ao deletar" });
    }
});

export default router;