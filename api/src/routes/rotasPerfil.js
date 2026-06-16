import { Router } from "express";
import { BD } from '../../db.js'; 
import { verificarToken } from '../../autenticacao.js'; 

const router = Router();

// 🔐 Todas as rotas de perfil exigem autenticação via Token JWT
router.use(verificarToken);

// ==========================================
// 🔍 1. GET /perfil → Buscar Perfil do Usuário Logado
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
                l.tipo_usuario -- 💡 Busca o tipo_usuario atualizado direto da tabela mestre
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
// ✏️ 4. PUT /perfil → Atualizar Perfil e Alterar Tipo de Usuário Dinamicamente
// ==========================================
router.put('/', async (req, res) => {
    const usuario_id = req.usuarioLogado.id; 
    const { nome_completo, telefone, nome_fazenda_ou_empresa, cpf_cnpj, tipo_usuario } = req.body;

    // 1. Validações básicas obrigatórias
    if (!nome_completo || !tipo_usuario) {
        return res.status(400).json({ 
            error: "ValidationError: Os campos 'nome_completo' e 'tipo_usuario' são obrigatórios.",
            message: "Para atualizar seu perfil, informe o Nome Completo e o seu Tipo de Usuário." 
        });
    }

    // 2. 🌟 Validação das opções aceitas no sistema
    const tiposPermitidos = ['comprador', 'vendedor', 'ambos'];
    const tipoFormatado = tipo_usuario.trim().toLowerCase();

    if (!tiposPermitidos.includes(tipoFormatado)) {
        return res.status(400).json({
            error: "ValidationError: Opção inválida para tipo_usuario.",
            message: "Escolha um tipo válido: comprador, vendedor ou ambos."
        });
    }

    try {
        // 🔄 PASSO 1: Atualizar o tipo_usuario na tabela mestre 'usuarios'
        const usuarioUpdate = await BD.query(`
            UPDATE usuarios 
            SET tipo_usuario = $1 
            WHERE id = $2
        `, [tipoFormatado, usuario_id]);

        if (usuarioUpdate.rowCount === 0) {
            return res.status(404).json({ 
                error: "ResourceNotFound: Usuário da autenticação não localizado.",
                message: "Não foi possível sincronizar o tipo de usuário." 
            });
        }

        // 🔄 PASSO 2: Atualizar os dados complementares na 'PerfilTabela'
        const { rows, rowCount } = await BD.query(`
            UPDATE PerfilTabela
            SET nome_completo = $1,
                telefone = $2,
                nome_fazenda_ou_empresa = $3,
                cpf_cnpj = $4,
                tipo_usuario = $5
            WHERE usuario_id = $6
            RETURNING usuario_id, nome_completo, telefone, nome_fazenda_ou_empresa, cpf_cnpj, tipo_usuario
        `, [nome_completo, telefone, nome_fazenda_ou_empresa, cpf_cnpj, tipoFormatado, usuario_id]);

        if (rowCount === 0) {
            return res.status(404).json({ 
                error: "ResourceNotFound: Perfil não localizado para o id " + usuario_id,
                message: "Seu perfil complementar não foi localizado para atualização." 
            });
        }

        return res.status(200).json({
            message: "Perfil e tipo de usuário atualizados com sucesso.",
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
// ❌ 5. DELETE /perfil → Deletar Próprio Perfil (Sem ID na URL)
// ==========================================
router.delete('/', async (req, res) => {
    const usuario_id = req.usuarioLogado.id;

    try {
        const { rowCount } = await BD.query(`
            DELETE FROM PerfilTabela WHERE usuario_id = $1
        `, [usuario_id]);

        if (rowCount === 0) {
            return res.status(404).json({ 
                error: "ResourceNotFound: Falha ao deletar, registro não existe para o id " + usuario_id,
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