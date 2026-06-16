import { Router } from "express";
import { BD } from '../../db.js'; 
import { verificarToken } from '../../autenticacao.js'; 

const router = Router();

// 🔐 todas rotas protegidas
router.use(verificarToken);


// ===============================
// 🔍 GET /perfil → buscar perfil
// ===============================
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
                l.tipo_usuario -- 💡 Buscando o tipo_usuario diretamente da tabela oficial de Login
            FROM PerfilTabela p
            INNER JOIN Login l ON l.id = p.usuario_id
            WHERE p.usuario_id = $1
        `, [usuario_id]);

        if (rows.length === 0) {
            return res.status(404).json({
                message: "Você ainda não tem um perfil cadastrado."
            });
        }

        return res.json(rows[0]);

    } catch (error) {
        console.error('Erro ao buscar perfil:', error.message);
        return res.status(500).json({
            message: "Erro ao buscar perfil."
        });
    }
});


// ===============================
// ➕ POST /perfil → criar perfil
// ===============================
router.post('/', async (req, res) => {
    const usuario_id = req.usuarioLogado.id;
    // 💡 Extraímos o tipo_usuario diretamente do Token, removendo a necessidade de vir no body
    const tipo_usuario = req.usuarioLogado.tipo_usuario; 
    const { nome_completo, telefone, nome_fazenda_ou_empresa, cpf_cnpj } = req.body;

    if (!nome_completo) {
        return res.status(400).json({
            message: "O nome completo é obrigatório."
        });
    }

    try {
        // 🚫 impedir duplicação de perfil para o mesmo usuário
        const existe = await BD.query(
            'SELECT 1 FROM PerfilTabela WHERE usuario_id = $1',
            [usuario_id]
        );

        if (existe.rows.length > 0) {
            return res.status(400).json({
                message: "Você já possui um perfil cadastrado."
            });
        }

        const { rows } = await BD.query(`
            INSERT INTO PerfilTabela 
            (usuario_id, nome_completo, telefone, nome_fazenda_ou_empresa, cpf_cnpj, tipo_usuario)
            VALUES ($1, $2, $3, $4, $5, $6)
            RETURNING usuario_id, nome_completo, telefone, nome_fazenda_ou_empresa, cpf_cnpj, tipo_usuario
        `, [usuario_id, nome_completo, telefone, nome_fazenda_ou_empresa, cpf_cnpj, tipo_usuario]);

        return res.status(201).json({
            message: "Perfil criado com sucesso.",
            perfil: rows[0]
        });

    } catch (error) {
        // 💡 Trata erro de CPF/CNPJ duplicado no banco (Código 23505)
        if (error.code === '23505') {
            return res.status(400).json({ 
                message: "Este CPF ou CNPJ já está cadastrado em outra conta." 
            });
        }

        console.error('Erro ao criar perfil:', error.message);
        return res.status(500).json({
            message: "Erro ao criar perfil."
        });
    }
});


// ===============================
// ✏️ PUT /perfil → atualizar
// ===============================
router.put('/', async (req, res) => {
    const usuario_id = req.usuarioLogado.id;
    const tipo_usuario = req.usuarioLogado.tipo_usuario; // 💡 Mantém sincronizado com o Token
    const { nome_completo, telefone, nome_fazenda_ou_empresa, cpf_cnpj } = req.body;

    if (!nome_completo) {
        return res.status(400).json({
            message: "O nome completo é obrigatório."
        });
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
            return res.status(404).json({
                message: "Perfil não encontrado."
            });
        }

        return res.json({
            message: "Perfil atualizado com sucesso.",
            perfil: rows[0]
        });

    } catch (error) {
        // 💡 Trata erro de CPF/CNPJ duplicado também na atualização
        if (error.code === '23505') {
            return res.status(400).json({ 
                message: "Este CPF ou CNPJ já está sendo utilizado por outro usuário." 
            });
        }

        console.error('Erro ao atualizar perfil:', error.message);
        return res.status(500).json({
            message: "Erro ao atualizar perfil."
        });
    }
});


// ===============================
// ❌ DELETE /perfil → deletar
// ===============================
router.delete('/', async (req, res) => {
    const usuario_id = req.usuarioLogado.id;

    try {
        const { rowCount } = await BD.query(
            'DELETE FROM PerfilTabela WHERE usuario_id = $1',
            [usuario_id]
        );

        if (rowCount === 0) {
            return res.status(404).json({
                message: "Perfil não encontrado."
            });
        }

        return res.json({
            message: "Perfil excluído com sucesso."
        });

    } catch (error) {
        console.error('Erro ao deletar perfil:', error.message);
        return res.status(500).json({
            message: "Erro ao deletar perfil."
        });
    }
});

export default router;