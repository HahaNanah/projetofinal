import { Router } from "express";
import { BD } from '../../db.js'; 
// IMPORTANTE: Importa o middleware que valida o token JWT
import { verificarToken } from '../../autenticacao.js'; 

const router = Router();

// APLICA PROTEÇÃO GLOBAL: Se der logout no Swagger, ninguém visualiza ou cria agendamentos!
router.use(verificarToken);

// ==========================================
// 1. POST - Criar um Novo Agendamento
// ==========================================
// Ajustado de '/agendamentos' para '/' para evitar URLs duplicadas na API
router.post('/', async (req, res) => {
    const id_comprador = req.usuarioLogado.id;
    const { id_produto: idProdutoBody, observacoes } = req.body ?? {};
    const id_produto = Number(idProdutoBody);

    if (!Number.isSafeInteger(id_produto) || id_produto <= 0) {
        return res.status(400).json({ 
            message: "Informe um id_produto válido."
        });
    }

    try {
        const produto = await BD.query(
            'SELECT 1 FROM Produtos WHERE id = $1',
            [id_produto]
        );

        if (produto.rowCount === 0) {
            return res.status(404).json({ message: "Produto não encontrado." });
        }

        // Insere o agendamento no banco de dados
        const { rows } = await BD.query(`
            INSERT INTO Agendamentos (id_comprador, id_produto, observacoes) 
            VALUES ($1, $2, $3) 
            RETURNING id, id_comprador, id_produto, status_agendamento, data_agendamento, observacoes
        `, [id_comprador, id_produto, observacoes]);

        return res.status(201).json({
            message: "Agendamento realizado com sucesso!",
            agendamento: rows[0]
        });

    } catch (error) {
        console.error('Erro ao criar agendamento no banco:', error.message);
        return res.status(500).json({ message: 'Erro interno ao processar agendamento.' });
    }
});

// ==========================================
// 2. GET - Listar Agendamentos com Detalhes (INNER JOIN)
// ==========================================
// Ajustado de '/agendamentos' para '/' para manter o padrão RESTful
router.get('/', async (req, res) => {
    try {
        // Busca os agendamentos trazendo os nomes legíveis em vez de apenas IDs
        const { rows } = await BD.query(`
            SELECT 
                a.id AS agendamento_id,
                p.nome_completo AS nome_comprador,
                prod.nome_produto,
                prod.preco,
                a.data_agendamento,
                a.status_agendamento,
                a.observacoes
            FROM Agendamentos a
            JOIN PerfilTabela p ON a.id_comprador = p.usuario_id
            JOIN Produtos prod ON a.id_produto = prod.id
            ORDER BY a.data_agendamento DESC
        `);
        
        return res.status(200).json(rows);
    } catch (error) {
        console.error('Erro ao listar agendamentos:', error.message);
        return res.status(500).json({ message: 'Erro interno ao listar agendamentos.' });
    }
});

// DELETE endpoint for agendamentos removed by request — use other flows instead

export default router;