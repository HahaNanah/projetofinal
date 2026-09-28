import { Router } from "express";
import { BD } from '../../db.js';
import { verificarToken } from '../../autenticacao.js'; 

const router = Router();

// 📌 1. CADASTRAR UM NOVO ANÚNCIO (Protegido por Token)
// POST /anuncios
router.post('/anuncios', verificarToken, async (req, res) => {
    const { categoria, titulo, preco, quantidade_disponivel, descricao, foto_produto, status } = req.body;
    const vendedor_id = req.usuario.id; // Pega o ID direto do Token JWT

    if (!categoria || !titulo || !preco) {
        return res.status(400).json({
            error: "ValidationError: Parâmetros essenciais ausentes no body -> categoria, titulo ou preco.",
            message: "Por favor, preencha o título, a categoria e o preço do anúncio."
        });
    }

    try {
        const { rows } = await BD.query(`
            INSERT INTO Anuncios (vendedor_id, categoria, titulo, preco, quantidade_disponivel, descricao, foto_produto, status)
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
            RETURNING id, vendedor_id, categoria, titulo, preco, quantidade_disponivel, status, criado_em
        `, [
            vendedor_id, 
            categoria, 
            titulo, 
            preco, 
            quantidade_disponivel || 1, 
            descricao, 
            foto_produto, 
            status || 'Ativo'
        ]);

        return res.status(201).json({
            message: "Anúncio cadastrado com sucesso na plataforma.",
            anuncio: rows[0]
        });

    } catch (error) {
        console.error("ERRO CADASTRO ANÚNCIO:", error.message);
        return res.status(500).json({
            error: "InternalServerError: Falha ao executar INSERT na tabela 'Anuncios'. Motivo técnico: " + error.message,
            message: "Não foi possível publicar o anúncio. Tente novamente mais tarde."
        });
    }
});


// 📌 2. LISTAR TODOS O ANÚNCIOS (Protegido por Token)
// GET /anuncios
router.get('/anuncios', verificarToken, async (req, res) => {
    const { categoria } = req.query;

    try {
        let queryText = `
            SELECT a.*, p.nome_completo AS nome_vendedor, p.nome_fazenda_ou_empresa
            FROM Anuncios a
            JOIN PerfilTabela p ON a.vendedor_id = p.usuario_id
            WHERE a.status = 'Ativo'
        `;
        const queryParams = [];

        if (categoria) {
            queryText += ` AND a.categoria = $1`;
            queryParams.push(categoria);
        }

        queryText += ` ORDER BY a.criado_em DESC`;

        const { rows } = await BD.query(queryText, queryParams);
        return res.status(200).json(rows);

    } catch (error) {
        console.error("ERRO LISTAR ANÚNCIOS:", error.message);
        return res.status(500).json({
            error: "InternalServerError: Falha na instrução SELECT na tabela 'Anuncios'. Motivo técnico: " + error.message,
            message: "Erro ao carregar o catálogo de anúncios."
        });
    }
});


// 📌 3. BUSCAR UM ANÚNCIO ESPECÍFICO PELO ID (Protegido por Token)
// GET /anuncios/:id
router.get('/anuncios/:id', verificarToken, async (req, res) => {
    const { id } = req.params;

    try {
        const { rows, rowCount } = await BD.query(`
            SELECT a.*, p.nome_completo AS nome_vendedor, p.nome_fazenda_ou_empresa, p.telefone
            FROM Anuncios a
            JOIN PerfilTabela p ON a.vendedor_id = p.usuario_id
            WHERE a.id = $1
        `, [id]);

        if (rowCount === 0) {
            return res.status(404).json({
                error: "ResourceNotFound: O ID '" + id + "' enviado no parâmetro da URL não foi localizado na tabela 'Anuncios'.",
                message: "O anúncio solicitado não foi encontrado."
            });
        }

        return res.status(200).json(rows[0]);

    } catch (error) {
        console.error("ERRO BUSCAR ANÚNCIO POR ID:", error.message);
        return res.status(500).json({
            error: "InternalServerError: Erro ao buscar ID '" + id + "' em 'Anuncios'. Motivo: " + error.message,
            message: "Não conseguimos abrir os detalhes deste anúncio."
        });
    }
});


// 📌 4. ATUALIZAR UM ANÚNCIO (Protegido por Token - Só o dono altera)
// PUT /anuncios/:id
router.put('/anuncios/:id', verificarToken, async (req, res) => {
    const { id } = req.params;
    const { categoria, titulo, preco, quantidade_disponivel, descricao, foto_produto, status } = req.body;
    const vendedor_id = req.usuario.id; // Garante que o ID vem do Token de quem está logado

    try {
        const { rows, rowCount } = await BD.query(`
            UPDATE Anuncios 
            SET categoria = $1, titulo = $2, preco = $3, quantidade_disponivel = $4, descricao = $5, foto_produto = $6, status = $7
            WHERE id = $8 AND vendedor_id = $9
            RETURNING *
        `, [categoria, titulo, preco, quantidade_disponivel, descricao, foto_produto, status, id, vendedor_id]);

        if (rowCount === 0) {
            return res.status(404).json({
                error: "AccessDeniedOrNotFound: Nenhuma linha afetada. Motivo: O anúncio não existe ou você não tem permissão para editá-lo.",
                message: "Não foi possível atualizar o anúncio. Verifique se ele pertence ao seu usuário."
            });
        }

        return res.status(200).json({
            message: "Anúncio atualizado com sucesso.",
            anuncio: rows[0]
        });

    } catch (error) {
        console.error("ERRO ATUALIZAR ANÚNCIO:", error.message);
        return res.status(500).json({
            error: "InternalServerError: Falha na cláusula UPDATE da tabela 'Anuncios'. Motivo: " + error.message,
            message: "Ocorreu um erro interno ao tentar salvar as alterações."
        });
    }
});


// 📌 5. DELETAR UM ANÚNCIO (Protegido por Token - Só o dono deleta)
// DELETE /anuncios/:id
router.delete('/anuncios/:id', verificarToken, async (req, res) => {
    const { id } = req.params;
    const vendedor_id = req.usuario.id; // Garante que o ID vem do Token de quem está logado

    try {
        const { rowCount } = await BD.query(`
            DELETE FROM Anuncios 
            WHERE id = $1 AND vendedor_id = $2
        `, [id, vendedor_id]);

        if (rowCount === 0) {
            return res.status(404).json({
                error: "AccessDeniedOrNotFound: O comando DELETE foi enviado, mas afetou 0 registros. Motivo: ID inexistente ou anúncio pertence a outro usuário.",
                message: "O anúncio não foi localizado ou você não tem permissão para excluí-lo."
            });
        }

        return res.status(200).json({
            message: "O anúncio foi permanentemente removido da plataforma."
        });

    } catch (error) {
        console.error("ERRO EXCLUIR ANÚNCIO:", error.message);
        return res.status(500).json({
            error: "InternalServerError: Erro crítico ao tentar remover o ID '" + id + "' de 'Anuncios'. Motivo: " + error.message,
            message: "Não foi possível excluir o anúncio devido a uma falha no sistema."
        });
    }
});

export default router;