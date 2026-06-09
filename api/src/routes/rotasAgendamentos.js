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
    const { id_comprador, id_produto, observacoes } = req.body;

    // Validação de campos obrigatórios
    if (!id_comprador || !id_produto) {
        return res.status(400).json({ 
            message: "Campos obrigatórios: id_comprador e id_produto." 
        });
    }

    try {
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

// ==========================================
// 3. DELETE - Remover um Agendamento por ID
// ==========================================
// Ajustado de '/agendamentos/:id' para '/:id'
router.delete('/:id', async (req, res) => {
    const { id } = req.params;

    try {
        // Executa a remoção no banco de dados usando o ID recebido na URL
        const { rowCount } = await BD.query(`
            DELETE FROM Agendamentos 
            WHERE id = $1
        `, [id]);

        // Se rowCount for 0, significa que nenhum agendamento tinha esse ID
        if (rowCount === 0) {
            return res.status(404).json({ 
                message: "Agendamento não encontrado." 
            });
        }

        return res.status(200).json({ 
            message: "Agendamento removido com sucesso!" 
        });

    } catch (error) {
        console.error('Erro ao deletar agendamento:', error.message);
        return res.status(500).json({ 
            message: 'Erro interno ao tentar remover o agendamento.' 
        });
    }
});

export default router;