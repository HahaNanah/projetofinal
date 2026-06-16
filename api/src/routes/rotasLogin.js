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
        return res.status(200).json(rows);
    } catch (error) {
        console.error('Erro ao listar logins: ', error.message);
        return res.status(500).json({ 
            error: "InternalServerError: Erro na instrução SELECT ao listar usuários da tabela 'login'. Motivo técnico: " + error.message,
            message: "Não foi possível carregar a lista de usuários. Tente novamente mais tarde." 
        });
    }
});


// 📌 LOGIN (AUTENTICAR)
router.post('/login/auth', async (req, res) => {
    const { email, senha, tipo_usuario } = req.body;

    if (!email || !senha || !tipo_usuario) {
        return res.status(400).json({ 
            error: "ValidationError: Parâmetros obrigatórios ausentes no corpo da requisição POST. Valores recebidos -> email: " + email + " | senha: " + (senha ? "[Preenchida]" : "[Vazia]") + " | tipo_usuario: " + tipo_usuario,
            message: "Por favor, preencha o e-mail, a senha e selecione o tipo de usuário." 
        });
    }

    try {
        const { rows, rowCount } = await BD.query(
            `SELECT id, email, tipo_usuario, senha
             FROM login 
             WHERE email = $1 AND tipo_usuario = $2`,
            [email, tipo_usuario]
        );

        if (rowCount === 0) {
            return res.status(401).json({ 
                error: "InvalidCredentialsError: Nenhuma correspondência encontrada na tabela 'login' para o email '" + email + "' combinado com o tipo de usuário '" + tipo_usuario + "'.",
                message: "E-mail ou tipo de usuário incorretos." 
            });
        }

        const usuario = rows[0];

        if (usuario.senha !== senha) {
            return res.status(401).json({ 
                error: "InvalidCredentialsError: O email '" + email + "' existe, mas a senha enviada no body não confere com a senha em texto puro armazenada no banco de dados.",
                message: "Senha incorreta. Tente novamente." 
            });
        }

        const token = jwt.sign(
            {
                id: usuario.id,
                email: usuario.email,
                tipo_usuario: usuario.tipo_usuario
            },
            JWT_SECRET
        );

        return res.status(200).json({
            message: "Autenticação efetuada com sucesso.",
            usuario,
            token
        });

    } catch (error) {
        console.error("ERRO LOGIN:", error.message);
        return res.status(500).json({
            error: "InternalServerError: Falha crítica interna no processo de autenticação de login. Motivo técnico: " + error.message,
            message: "Ops! Ocorreu um erro no sistema ao tentar fazer login."
        });
    }
});


// 📌 CADASTRO
router.post('/login', async (req, res) => {
    const { email, senha, tipo_usuario } = req.body;

    if (!email || !senha || !tipo_usuario) {
        return res.status(400).json({
            error: "ValidationError: Atributos estruturais para criação de registro ausentes no payload. Valores atuais -> email: " + email + " | tipo_usuario: " + tipo_usuario,
            message: "Para se cadastrar, você precisa preencher o e-mail, a senha e o tipo de usuário."
        });
    }

    try {
        const { rows } = await BD.query(`
            INSERT INTO login (email, senha, tipo_usuario) 
            VALUES ($1, $2, $3) 
            RETURNING id, email, tipo_usuario
        `, [email, senha, tipo_usuario]);

        return res.status(201).json({
            message: "Registro de usuário realizado com sucesso.",
            usuario: rows[0]
        });

    } catch (error) {
        if (error.code === '23505') {
            return res.status(400).json({ 
                error: "ConflictError: Violação da restrição UNIQUE no banco de dados. O email '" + email + "' já consta registrado no sistema.",
                message: "Este e-mail já está cadastrado em outra conta." 
            });
        }

        console.error("ERRO CADASTRO:", error.message);
        return res.status(500).json({
            error: "InternalServerError: Falha ao tentar rodar a instrução INSERT na tabela 'login'. Motivo técnico: " + error.message,
            message: "Não foi possível concluir o seu cadastro devido a um erro interno."
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
            return res.status(404).json({ 
                error: "ResourceNotFound: A instrução UPDATE executou com sucesso, mas afetou 0 linhas. Motivo: O ID '" + id + "' enviado no parâmetro da URL não foi localizado na tabela 'login'.",
                message: "O usuário que você tentou atualizar não foi encontrado." 
            });
        }

        return res.status(200).json({ 
            message: "Os dados de acesso foram atualizados com sucesso.", 
            usuario: rows[0] 
        });

    } catch (error) {
        console.error('Erro ao atualizar login:', error.message);
        return res.status(500).json({ 
            error: "InternalServerError: Falha no processamento da cláusula UPDATE para o ID '" + id + "'. Motivo técnico: " + error.message,
            message: "Não conseguimos salvar as alterações do usuário. Tente novamente." 
        });
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
            return res.status(404).json({ 
                error: "ResourceNotFound: O comando DELETE foi enviado, mas nenhuma linha foi removida. Motivo: O registro com o ID '" + id + "' não existe na tabela 'login'.",
                message: "O usuário solicitado para exclusão não foi localizado ou já foi apagado." 
            });
        }

        return res.status(200).json({ 
            message: "As credenciais do usuário foram permanentemente excluídas do sistema." 
        });

    } catch (error) {
        console.error('Erro ao deletar login:', error.message);
        return res.status(500).json({ 
            error: "InternalServerError: Erro crítico ao tentar remover o ID '" + id + "' da tabela 'login'. Motivo técnico: " + error.message,
            message: "Não foi possível excluir o usuário devido a um problema no sistema." 
        });
    }
});

export default router;