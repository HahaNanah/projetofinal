import { Router } from "express";
import { BD } from '../../db.js'; 
import { verificarToken } from '../../autenticacao.js'; 

const router = Router();

// 🔐 Todas as rotas de agendamento exigem autenticação via Token JWT
router.use(verificarToken);

// ==========================================
// ➕ POST / → Criar um Agendamento (ID do comprador via JWT)
// ==========================================
router.post('/', async (req, res) => {
    // 💡 Captura o ID do comprador logado direto do Token de segurança!
    const id_comprador = req.usuarioLogado.id;
    const { id_produto, observacoes } = req.body;

    // Agora apenas o id_produto é obrigatório no body
    if (!id_produto) {
        return res.status(400).json({ 
            error: "ValidationError: Parâmetro obrigatório 'id_produto' ausente no body da requisição POST.",
            message: "Por favor, selecione o produto para realizar o agendamento." 
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
            error: "InternalServerError: Falha ao executar a instrução INSERT na tabela 'Agendamentos'. Motivo técnico: " + error.message,
            message: "Não conseguimos salvar o agendamento devido a um erro no sistema." 
        });
    }
});

// ==========================================
// 🔍 GET / → Listar todos os agendamentos
// ==========================================
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
            error: "InternalServerError: Falha na execução da query SELECT com JOINs na tabela 'Agendamentos'. Motivo técnico: " + error.message,
            message: "Não foi possível carregar a lista de agendamentos. Tente novamente mais tarde." 
        });
    }
});

export default router;