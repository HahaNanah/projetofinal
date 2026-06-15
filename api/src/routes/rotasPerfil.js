import { Router } from "express";
import { BD } from '../../db.js'; 
import { verificarToken } from '../../autenticacao.js'; // Importa o middleware de segurança

const router = Router();

// APLICA PROTEÇÃO GLOBAL: Todas as rotas de perfil abaixo exigem obrigatoriamente o Token JWT!
router.use(verificarToken);

// =========================================================================
// 1. GET - Buscar Perfil do Usuário Logado (Pega o ID direto do Token!)
// =========================================================================
router.get('/', async (req, res) => {
    // O id vem descriptografado do token inserido pelo middleware verificarToken
    const usuario_id = req.usuarioLogado.id;

    try {
        const { rows } = await BD.query(`
            SELECT 
                p.usuario_id, 
                l.email, 
                p.nome_completo, 
                p.telefone, 
                p.nome_fazenda_ou_empresa, 
                p.cpf_cnpj, 
                p.tipo_usuario
            FROM PerfilTabela p
            INNER JOIN Login l ON l.id = p.usuario_id
            WHERE p.usuario_id = $1
        `, [usuario_id]);

        if (rows.length === 0) {
            return res.status(404).json({ message: "Perfil não encontrado." });
        }

        return res.status(200).json(rows[0]);
    } catch (error) {
        console.error('Erro ao buscar perfil:', error);
        return res.status(500).json({ message: 'Erro interno ao buscar perfil.' });
    }
});

// =========================================================================
// 2. POST - Criar Perfil Protegido (Vincula automaticamente com o Token)
// =========================================================================
router.post('/', async (req, res) => {
    const usuario_id = req.usuarioLogado.id; // Garante que o perfil será criado para o usuário do token
    const { nome_completo, telefone, nome_fazenda_ou_empresa, cpf_cnpj, tipo_usuario } = req.body;

    // Validação básica (removido usuario_id do body porque agora vem do token)
    if (!nome_completo || !tipo_usuario) {
        return res.status(400).json({ 
            message: "Campos obrigatórios: nome_completo e tipo_usuario." 
        });
    }

    try {
        // Verifica se o perfil já existe
        const perfilExistente = await BD.query('SELECT 1 FROM PerfilTabela WHERE usuario_id = $1', [usuario_id]);
        if (perfilExistente.rows.length > 0) {
            return res.status(400).json({ message: "O perfil para este usuário já está cadastrado." });
        }

        // Insere o novo perfil
        const { rows } = await BD.query(`
            INSERT INTO PerfilTabela (usuario_id, nome_completo, telefone, nome_fazenda_ou_empresa, cpf_cnpj, tipo_usuario)
            VALUES ($1, $2, $3, $4, $5, $6)
            RETURNING usuario_id, nome_completo, telefone, nome_fazenda_ou_empresa, cpf_cnpj, tipo_usuario
        `, [usuario_id, nome_completo, telefone, nome_fazenda_ou_empresa, cpf_cnpj, tipo_usuario]);

        return res.status(201).json({
            message: "Perfil criado com sucesso!",
            perfil: rows[0]
        });
    } catch (error) {
        console.error('Erro ao criar perfil:', error);
        return res.status(500).json({ message: 'Erro interno ao salvar perfil.' });
    }
});

// =========================================================================
// 3. PUT - Atualizar Dados do Perfil (Segurança total via Token)
// =========================================================================
// ROTA OPCIONAL: aceitar `/perfil/:usuario_id` (verifica que o token pertence ao mesmo usuário)
router.put('/:usuario_id', async (req, res) => {
    const usuario_id_param = parseInt(req.params.usuario_id, 10);
    if (isNaN(usuario_id_param)) {
        return res.status(400).json({ message: "usuario_id inválido." });
    }

    const usuario_id_logado = req.usuarioLogado.id;
    if (usuario_id_logado !== usuario_id_param) {
        return res.status(403).json({ message: "Acesso negado. Só é possível alterar o próprio perfil." });
    }

    const { nome_completo, telefone, nome_fazenda_ou_empresa, cpf_cnpj, tipo_usuario } = req.body;

    if (!nome_completo || !tipo_usuario) {
        return res.status(400).json({ message: "Os campos nome_completo e tipo_usuario são obrigatórios." });
    }

    try {
        const { rows, rowCount } = await BD.query(`
            UPDATE PerfilTabela
            SET nome_completo = $1,
                telefone = $2,
                nome_fazenda_ou_empresa = $3,
                cpf_cnpj = $4,
                tipo_usuario = $5
            WHERE usuario_id = $6
            RETURNING usuario_id, nome_completo, telefone, nome_fazenda_ou_empresa, cpf_cnpj, tipo_usuario
        `, [nome_completo, telefone, nome_fazenda_ou_empresa, cpf_cnpj, tipo_usuario, usuario_id_param]);

        if (rowCount === 0) {
            return res.status(404).json({ message: "Perfil não encontrado para atualização." });
        }

        return res.status(200).json({
            message: "Perfil updated com sucesso!",
            perfil: rows[0]
        });
    } catch (error) {
        console.error('Erro ao atualizar perfil (param):', error);
        return res.status(500).json({ message: 'Erro interno ao atualizar perfil.' });
    }
});

router.put('/', async (req, res) => {
    const usuario_id = req.usuarioLogado.id; // impede que um usuário edite o perfil de outro
    const { nome_completo, telefone, nome_fazenda_ou_empresa, cpf_cnpj, tipo_usuario } = req.body;

    if (!nome_completo || !tipo_usuario) {
        return res.status(400).json({ message: "Os campos nome_completo e tipo_usuario são obrigatórios." });
    }

    try {
        const { rows, rowCount } = await BD.query(`
            UPDATE PerfilTabela
            SET nome_completo = $1,
                telefone = $2,
                nome_fazenda_ou_empresa = $3,
                cpf_cnpj = $4,
                tipo_usuario = $5
            WHERE usuario_id = $6
            RETURNING usuario_id, nome_completo, telefone, nome_fazenda_ou_empresa, cpf_cnpj, tipo_usuario
        `, [nome_completo, telefone, nome_fazenda_ou_empresa, cpf_cnpj, tipo_usuario, usuario_id]);

        if (rowCount === 0) {
            return res.status(404).json({ message: "Perfil não encontrado para atualização." });
        }

        return res.status(200).json({
            message: "Perfil updated com sucesso!",
            perfil: rows[0]
        });
    } catch (error) {
        console.error('Erro ao atualizar perfil:', error);
        return res.status(500).json({ message: 'Erro interno ao atualizar perfil.' });
    }
});

export default router;

// =========================================================================
// 4. DELETE - Remover Perfil por ID (verifica que o token pertence ao mesmo usuário)
// =========================================================================
// ROTA: DELETE /perfil/:usuario_id
router.delete('/:usuario_id', async (req, res) => {
    const usuario_id_param = parseInt(req.params.usuario_id, 10);
    if (isNaN(usuario_id_param)) {
        return res.status(400).json({ message: "usuario_id inválido." });
    }

    const usuario_id_logado = req.usuarioLogado.id;
    if (usuario_id_logado !== usuario_id_param) {
        return res.status(403).json({ message: "Acesso negado. Só é possível deletar o próprio perfil." });
    }

    try {
        const { rowCount } = await BD.query(`
            DELETE FROM PerfilTabela
            WHERE usuario_id = $1
        `, [usuario_id_param]);

        if (rowCount === 0) {
            return res.status(404).json({ message: "Perfil não encontrado." });
        }

        return res.status(200).json({ message: "Perfil removido com sucesso!" });
    } catch (error) {
        console.error('Erro ao deletar perfil:', error);
        return res.status(500).json({ message: 'Erro interno ao deletar perfil.' });
    }
});