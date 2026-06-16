import { Router } from "express";
import { BD } from '../../db.js'; 
import { verificarToken } from '../../autenticacao.js'; 

const router = Router();

router.use(verificarToken);

router.post('/', async (req, res) => {
    const { id_comprador, id_produto, observacoes } = req.body;

    if (!id_comprador || !id_produto) {
        return res.status(400).json({ 
            error: "ValidationError: Parâmetros obrigatórios ausentes no body da requisição POST. Valores recebidos -> id_comprador: " + id_comprador + " | id_produto: " + id_produto + ".",
            message: "Por favor, selecione o comprador e o produto para realizar o agendamento." 
        });
    }

    try { 
        const { rows } = await BD.query(`
            INSERT INTO Agendamentos (id_comprador, id_produto, observacoes) 
            VALUES ($1, $2, $3) 
            RETURNING id, id_comprador, id_produto, status_agendamento, data_agendamento, observacoes
        `, [id_comprador, id_produto, observacoes]);

        return res.status(201).json({
            message: "Agendamento registrado com sucesso.",
            agendamento: rows[0]
        });

    } catch (error) {
        console.error('Erro ao criar agendamento no banco:', error.message);
        return res.status(500).json({ 
            error: "InternalServerError: Falha ao executar a instrução INSERT na tabela 'Agendamentos'. Motivo técnico: " + error.message + " | Dados enviados -> id_comprador: " + id_comprador + ", id_produto: " + id_produto + ".",
            message: "Não conseguimos salvar o agendamento devido a um erro no sistema." 
        });
    }
});

router.get('/', async (req, res) => {
    try {
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
        return res.status(500).json({ 
            error: "InternalServerError: Falha na execução da query SELECT com JOINs na tabela 'Agendamentos'. Motivo técnico: " + error.message + ". Verifique a integridade das chaves estrangeiras.",
            message: "Não foi possível carregar a lista de agendamentos. Tente novamente mais tarde." 
        });
    }
});

export default router;