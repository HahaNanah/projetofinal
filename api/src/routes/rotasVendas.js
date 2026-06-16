import { Router } from "express";
import { BD } from '../../db.js';
import { verificarToken } from '../../autenticacao.js'; 

const router = Router();

// 📌 1. REGISTRAR UMA NOVA VENDA (Comprador Logado)
// POST /vendas
router.post('/vendas', verificarToken, async (req, res) => {
    const { id_anuncio, id_vendedor, quantidade_comprada, valor_total, status_pagamento, status_entrega } = req.body;
    const id_comprador = req.usuario.id; // Extraído do Token JWT

    if (!id_anuncio || !id_vendedor || !valor_total) {
        return res.status(400).json({
            error: "ValidationError: Parâmetros obrigatórios ausentes no body -> id_anuncio, id_vendedor ou valor_total.",
            message: "Não foi possível registrar a venda. Dados da transação incompletos."
        });
    }

    try {
        // Registra a venda no banco de dados
        const { rows } = await BD.query(`
            INSERT INTO Vendas (id_anuncio, id_comprador, id_vendedor, quantidade_comprada, valor_total, status_pagamento, status_entrega)
            VALUES ($1, $2, $3, $4, $5, $6, $7)
            RETURNING id, id_anuncio, id_comprador, id_vendedor, quantidade_comprada, valor_total, status_pagamento, status_entrega, data_venda
        `, [
            id_anuncio,
            id_comprador,
            id_vendedor,
            quantidade_comprada || 1,
            valor_total,
            status_pagamento || 'Pendente',
            status_entrega || 'Processando'
        ]);

        // Cria uma Notificação automática para o Vendedor avisando que ele vendeu!
        if (rows && rows.length > 0) {
            await BD.query(`
                INSERT INTO Notificacoes (id_usuario, titulo, mensagem, tipo, id_referencia)
                VALUES ($1, 'Nova venda realizada!', 'Um comprador registrou a compra do seu anúncio.', 'sistema', $2)
            `, [id_vendedor, rows[0].id]);
        }

        return res.status(201).json({
            message: "Transação de venda registrada com sucesso!",
            venda: rows[0]
        });

    } catch (error) {
        console.error("ERRO AO REGISTRAR VENDA:", error.message);
        return res.status(500).json({
            error: "InternalServerError: Falha ao executar INSERT na tabela 'Vendas'. Motivo técnico: " + error.message,
            message: "Não foi possível concluir o registro da venda no sistema."
        });
    }
});


// 📌 2. LISTAR HISTÓRICO DE COMPRAS (Do usuário que está logado)
// GET /vendas/compras
router.get('/vendas/compras', verificarToken, async (req, res) => {
    const id_comprador = req.usuario.id;

    try {
        const { rows } = await BD.query(`
            SELECT v.*, a.titulo AS nome_anuncio, perf.nome_completo AS nome_vendedor
            FROM Vendas v
            LEFT JOIN Anuncios a ON v.id_anuncio = a.id
            JOIN PerfilTabela perf ON v.id_vendedor = perf.usuario_id
            WHERE v.id_comprador = $1
            ORDER BY v.data_venda DESC
        `, [id_comprador]);

        return res.status(200).json(rows);
    } catch (error) {
        console.error("ERRO LISTAR COMPRAS:", error.message);
        return res.status(500).json({
            error: "InternalServerError: Falha no SELECT de compras na tabela 'Vendas'. Motivo: " + error.message,
            message: "Não foi possível carregar seu histórico de compras."
        });
    }
});


// 📌 3. LISTAR HISTÓRICO DE VENDAS RECEBIDAS (Do vendedor que está logado)
// GET /vendas/pedidos
router.get('/vendas/pedidos', verificarToken, async (req, res) => {
    const id_vendedor = req.usuario.id;

    try {
        const { rows } = await BD.query(`
            SELECT v.*, a.titulo AS nome_anuncio, perf.nome_completo AS nome_comprador
            FROM Vendas v
            LEFT JOIN Anuncios a ON v.id_anuncio = a.id
            JOIN PerfilTabela perf ON v.id_comprador = perf.usuario_id
            WHERE v.id_vendedor = $1
            ORDER BY v.data_venda DESC
        `, [id_vendedor]);

        return res.status(200).json(rows);
    } catch (error) {
        console.error("ERRO LISTAR VENDAS:", error.message);
        return res.status(500).json({
            error: "InternalServerError: Falha no SELECT de vendas na tabela 'Vendas'. Motivo: " + error.message,
            message: "Não foi possível carregar seus pedidos recebidos."
        });
    }
});


// 📌 4. ATUALIZAR STATUS DA VENDA/ENTREGA (Apenas o vendedor do produto pode alterar)
// PUT /vendas/:id
router.put('/vendas/:id', verificarToken, async (req, res) => {
    const { id } = req.params;
    const { status_pagamento, status_entrega } = req.body;
    const id_vendedor = req.usuario.id;

    try {
        const { rows, rowCount } = await BD.query(`
            UPDATE Vendas
            SET status_pagamento = COALESCE($1, status_pagamento),
                status_entrega = COALESCE($2, status_entrega)
            WHERE id = $3 AND id_vendedor = $4
            RETURNING *
        `, [status_pagamento, status_entrega, id, id_vendedor]);

        if (rowCount === 0) {
            return res.status(404).json({
                error: "AccessDeniedOrNotFound: O registro de venda não existe ou você não tem autorização para alterá-lo.",
                message: "Não foi possível atualizar o status deste pedido."
            });
        }

        return res.status(200).json({
            message: "Status do pedido updated com sucesso.",
            venda: rows[0]
        });

    } catch (error) {
        console.error("ERRO ATUALIZAR STATUS DA VENDA:", error.message);
        return res.status(500).json({
            error: "InternalServerError: Falha na instrução UPDATE na tabela 'Vendas'. Motivo: " + error.message,
            message: "Erro interno ao tentar atualizar o andamento do pedido."
        });
    }
});

export default router;