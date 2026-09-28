import { Router } from "express";
import { BD } from '../../db.js'; 
import { verificarToken } from '../../autenticacao.js'; 

const router = Router();

// 🔐 Todas as rotas de agendamento exigem autenticação via Token JWT
router.use(verificarToken);

// ==========================================
// ➕ POST / → Criar um Agendamento
// ==========================================
router.post('/', async (req, res) => {
    // 🔐 Captura o ID real do comprador logado direto do Token de segurança!
    const idDoToken = req.usuarioLogado.id;
    const { id_comprador, id_produto, observacoes } = req.body;

    // 🛑 VALIDAÇÃO DE SEGURANÇA: Bloqueia se tentarem forçar um id_comprador falso no corpo
    if (id_comprador && Number(id_comprador) !== Number(idDoToken)) {
        return res.status(403).json({
            error: "ForbiddenError: Operação não permitida.",
            message: `Você está autenticado como o usuário ${idDoToken}, mas tentou criar um agendamento informando o id_comprador ${id_comprador}.`
        });
    }

    // Validação do parâmetro obrigatório do produto
    if (!id_produto) {
        return res.status(400).json({ 
            error: "ValidationError: Parâmetro obrigatório 'id_produto' ausente no body da requisição POST.",
            message: "Por favor, selecione o produto para realizar o agendamento." 
        });
    }

    try { 
        // Garante a inserção usando o ID verificado e blindado do Token (idDoToken)
        const { rows } = await BD.query(`
            INSERT INTO Agendamentos (id_comprador, id_produto, observacoes) 
            VALUES ($1, $2, $3) 
            RETURNING id, id_comprador, id_produto, status_agendamento, data_agendamento, observacoes
        `, [idDoToken, id_produto, observacoes]);

        return res.status(201).json({
            message: "Agendamento registrado com sucesso.",
            agendamento: rows[0]
        });

    } catch (error) {
        console.error('Erro ao criar agendamento no banco:', error.message);
        
        // Se o produto não existir no banco, capturamos o erro de Foreign Key de forma limpa
        if (error.code === '23503') {
            return res.status(404).json({
                error: "ConstraintViolationError",
                message: `O produto com ID ${id_produto} não existe no nosso catálogo. Verifique o ID e tente novamente.`
            });
        }

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
        // 💡 ATENÇÃO: Caso tenha renomeado 'PerfilTabela' no Supabase para 'perfis', altere aqui também!
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