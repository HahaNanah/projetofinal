import { Router } from "express";
import { BD } from '../../db.js'; 
import { verificarToken } from '../../autenticacao.js'; 
import jwt from 'jsonwebtoken'; // 💡 Importado para gerar o novo token no PUT

const router = Router();

// 🔐 Todas as rotas de perfil exigem autenticação via Token JWT
router.use(verificarToken);

// ==========================================
// ➕ POST /:id → Cadastrar Perfil com Validação
// ==========================================
router.post('/:id', async (req, res) => {
    const idDoToken = req.usuarioLogado.id;
    const { id } = req.params; // ID enviado na URL do Swagger
    const { nome_completo, telefone, nome_fazenda_ou_empresa, cpf_cnpj, tipo_usuario } = req.body;

    // 🛑 VALIDAÇÃO DE SEGURANÇA: Bloqueia IDs falsos passados na URL
    if (Number(id) !== Number(idDoToken)) {
        return res.status(403).json({
            error: "ForbiddenError: Operação não permitida.",
            message: `Você está autenticado como o usuário ${idDoToken}, mas tentou criar um perfil para o ID ${id}.`
        });
    }

    // Validações básicas obrigatórias
    if (!nome_completo || !tipo_usuario) {
        return res.status(400).json({ 
            error: "ValidationError: Os campos 'nome_completo' e 'tipo_usuario' são obrigatórios.",
            message: "Para cadastrar seu perfil, informe o Nome Completo e o seu Tipo de Usuário." 
        });
    }

    const tiposPermitidos = ['comprador', 'vendedor', 'ambos'];
    const tipoFormatado = tipo_usuario.trim().toLowerCase();

    if (!tiposPermitidos.includes(tipoFormatado)) {
        return res.status(400).json({
            error: "ValidationError: Opção inválida para tipo_usuario.",
            message: "Escolha um tipo válido: comprador, vendedor ou ambos."
        });
    }

    try {
        const { rows } = await BD.query(`
            INSERT INTO PerfilTabela (usuario_id, nome_completo, telefone, nome_fazenda_ou_empresa, cpf_cnpj, tipo_usuario)
            VALUES ($1, $2, $3, $4, $5, $6)
            RETURNING usuario_id, nome_completo, telefone, nome_fazenda_ou_empresa, cpf_cnpj, tipo_usuario
        `, [idDoToken, nome_completo, telefone || null, nome_fazenda_ou_empresa || null, cpf_cnpj || null, tipoFormatado]);

        return res.status(201).json({
            message: "Perfil criado com sucesso.",
            perfil: rows[0]
        });
    } catch (error) {
        if (error.code === '23505') {
            return res.status(400).json({ 
                error: "ConflictError: Perfil ou CPF/CNPJ já cadastrado.",
                message: "Você já possui um perfil cadastrado ou este documento já está associado a outra conta." 
            });
        }
        console.error('Erro ao criar perfil:', error.message);
        return res.status(500).json({ 
            error: "InternalServerError: Falha ao inserir registro na tabela 'PerfilTabela'. Motivo: " + error.message,
            message: "Houve um problema interno ao salvar as informações do seu perfil." 
        });
    }
});

// ==========================================
// 🔍 GET / → Buscar Perfil do Usuário Logado
// ==========================================
router.get('/', async (req, res) => {
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
                l.tipo_usuario 
            FROM PerfilTabela p
            INNER JOIN usuarios l ON l.id = p.usuario_id
            WHERE p.usuario_id = $1
        `, [usuario_id]);

        if (rows.length === 0) {
            return res.status(404).json({ 
                error: "ResourceNotFound: Registro ausente na tabela 'PerfilTabela' para o usuario_id " + usuario_id,
                message: "Você ainda não tem um perfil cadastrado." 
            });
        }

        return res.status(200).json(rows[0]);
    } catch (error) {
        console.error('Erro ao buscar perfil:', error.message);
        return res.status(500).json({ 
            error: "InternalServerError: Falha na query SELECT. Motivo: " + error.message,
            message: "Não foi possível carregar o seu perfil. Tente novamente mais tarde." 
        });
    }
});


// ==========================================
// ✏️ PUT /:id → Atualizar Perfil (Com Renovação de Token JWT)
// ==========================================
router.put('/:id', async (req, res) => {
    const idDoToken = req.usuarioLogado.id; 
    const { id } = req.params; // ID enviado na URL do Swagger
    const { nome_completo, telefone, nome_fazenda_ou_empresa, cpf_cnpj, tipo_usuario } = req.body;

    // 🛑 VALIDAÇÃO DE SEGURANÇA: Bloqueia se o ID da URL não bater com o Token
    if (Number(id) !== Number(idDoToken)) {
        return res.status(403).json({
            error: "ForbiddenError: Operação não permitida.",
            message: `Você está autenticado como o usuário ${idDoToken}, mas tentou atualizar o perfil do ID ${id}.`
        });
    }

    if (!nome_completo || !tipo_usuario) {
        return res.status(400).json({ 
            error: "ValidationError: Os campos 'nome_completo' e 'tipo_usuario' são obrigatórios.",
            message: "Para atualizar seu perfil, informe o Nome Completo e o seu Tipo de Usuário." 
        });
    }

    const tiposPermitidos = ['comprador', 'vendedor', 'ambos'];
    const tipoFormatado = tipo_usuario.trim().toLowerCase();

    if (!tiposPermitidos.includes(tipoFormatado)) {
        return res.status(400).json({
            error: "ValidationError: Opção inválida para tipo_usuario.",
            message: "Escolha um tipo válido: comprador, vendedor ou ambos."
        });
    }

    try {
        const usuarioUpdate = await BD.query(`
            UPDATE usuarios 
            SET tipo_usuario = $1 
            WHERE id = $2
        `, [tipoFormatado, idDoToken]);

        if (usuarioUpdate.rowCount === 0) {
            return res.status(404).json({ 
                error: "ResourceNotFound: Usuário da autenticação não localizado.",
                message: "Não foi possível sincronizar o tipo de usuário." 
            });
        }

        const { rows, rowCount } = await BD.query(`
            UPDATE PerfilTabela
            SET nome_completo = $1,
                telefone = $2,
                nome_fazenda_ou_empresa = $3,
                cpf_cnpj = $4,
                tipo_usuario = $5
            WHERE usuario_id = $6
            RETURNING usuario_id, nome_completo, telefone, nome_fazenda_ou_empresa, cpf_cnpj, tipo_usuario
        `, [nome_completo, telefone, nome_fazenda_ou_empresa, cpf_cnpj, tipoFormatado, idDoToken]);

        if (rowCount === 0) {
            return res.status(404).json({ 
                error: "ResourceNotFound: Perfil não localizado para o id " + idDoToken,
                message: "Seu perfil complementar não foi localizado para atualização." 
            });
        }

        // ✨ SOLUÇÃO DO TOKEN ANTIGO: Gera um token novinho com o tipo atualizado
        const novoToken = jwt.sign(
            { id: idDoToken, email: req.usuarioLogado.email, tipo_usuario: tipoFormatado },
            process.env.JWT_SECRET || 'sua_chave_secreta_aqui',
            { expiresIn: '1d' }
        );

        return res.status(200).json({
            message: "Perfil e tipo de usuário atualizados com sucesso.",
            token_atualizado: novoToken, // O frontend pega este token para não precisar deslogar!
            perfil: rows[0]
        });
    } catch (error) {
        if (error.code === '23505') {
            return res.status(400).json({ 
                error: "ConflictError: CPF/CNPJ já cadastrado.",
                message: "Este CPF ou CNPJ já está associado a outra conta." 
            });
        }
        console.error('Erro ao atualizar perfil com tipo de usuário:', error.message);
        return res.status(500).json({ 
            error: "InternalServerError: Erro no processo de sincronização multi-tabela. Motivo: " + error.message,
            message: "Houve um problema interno ao salvar as modificações." 
        });
    }
});


// ==========================================
// ❌ DELETE /:id → Deletar Próprio Perfil
// ==========================================
router.delete('/:id', async (req, res) => {
    const idDoToken = req.usuarioLogado.id;
    const { id } = req.params;

    if (Number(id) !== Number(idDoToken)) {
        return res.status(403).json({
            error: "ForbiddenError: Operação não permitida.",
            message: `Você está autenticado como o usuário ${idDoToken}, mas tentou apagar o perfil informando o ID ${id}.`
        });
    }

    try {
        const { rowCount } = await BD.query(`
            DELETE FROM PerfilTabela WHERE usuario_id = $1
        `, [idDoToken]);

        if (rowCount === 0) {
            return res.status(404).json({ 
                error: "ResourceNotFound: Falha ao deletar, registro não existe para o id " + idDoToken,
                message: "O seu perfil não foi encontrado ou já foi apagado." 
            });
        }

        return res.status(200).json({ message: "Seu perfil foi excluído com sucesso." });
    } catch (error) {
        console.error('Erro ao deletar perfil:', error.message);
        return res.status(500).json({ 
            error: "InternalServerError: Falha na exclusão física do registro. Motivo: " + error.message,
            message: "Não foi possível realizar a exclusão do perfil devido a um erro interno." 
        });
    }
});

export default router;