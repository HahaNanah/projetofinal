import { Router } from "express";
import { BD } from '../../db.js';
import { verificarToken } from '../../autenticacao.js'; 

const router = Router();

async function buscarChatDoUsuario(id_chat, usuario_id) {
    const { rows } = await BD.query(
        `SELECT id, id_comprador, id_vendedor FROM Chats
         WHERE id = $1 AND (id_comprador = $2 OR id_vendedor = $2)`,
        [id_chat, usuario_id]
    );

    return rows[0];
}

// 📌 1. CRIAR OU RETORNAR UM CHAT EXISTENTE
router.post('/chats', verificarToken, async (req, res) => {
    const { id_produto, id_vendedor } = req.body;
    const id_comprador = req.usuarioLogado.id; // ID que vem do token JWT de quem está logado

    if (!id_produto || !id_vendedor) {
        return res.status(400).json({
            error: "ValidationError: Parâmetros obrigatórios ausentes no body -> id_produto ou id_vendedor.",
            message: "Não foi possível iniciar o chat. Dados do produto ou vendedor estão faltando."
        });
    }

    try {
        // Verifica se já existe um chat aberto desse produto entre esse comprador e esse vendedor
        const chatExistente = await BD.query(
            `SELECT id FROM Chats WHERE id_produto = $1 AND id_comprador = $2 AND id_vendedor = $3`,
            [id_produto, id_comprador, id_vendedor]
        );

        if (chatExistente.rowCount > 0) {
            return res.status(200).json({
                message: "Chat já existente localizado.",
                chat: chatExistente.rows[0]
            });
        }

        // Cria o chat se for o primeiro contato
        const { rows } = await BD.query(
            `INSERT INTO Chats (id_produto, id_comprador, id_vendedor) 
             VALUES ($1, $2, $3) 
             RETURNING id, id_produto, id_comprador, id_vendedor, criado_em`,
            [id_produto, id_comprador, id_vendedor]
        );

        return res.status(201).json({
            message: "Sala de chat iniciada com sucesso.",
            chat: rows[0]
        });

    } catch (error) {
        console.error("ERRO CRIAR CHAT:", error.message);
        return res.status(500).json({
            error: "InternalServerError: Falha ao rodar INSERT na tabela 'Chats'. Motivo: " + error.message,
            message: "Erro ao tentar iniciar a conversa."
        });
    }
});


// 📌 2. LISTAR OS CHATS DO USUÁRIO LOGADO (Comprador ou Vendedor)
router.get('/chats', verificarToken, async (req, res) => {
    const id_usuario = req.usuarioLogado.id;

    try {
        // Puxa as informações baseadas estritamente na sua tabela de Produtos e PerfilTabela
        const { rows } = await BD.query(
            `SELECT c.id AS chat_id, c.criado_em, p.nome_produto, p.foto_produto,
                    perf_comp.nome_completo AS nome_comprador, 
                    perf_vend.nome_completo AS nome_vendedor
             FROM Chats c
             JOIN Produtos p ON c.id_produto = p.id
             JOIN PerfilTabela perf_comp ON c.id_comprador = perf_comp.usuario_id
             JOIN PerfilTabela perf_vend ON c.id_vendedor = perf_vend.usuario_id
             WHERE c.id_comprador = $1 OR c.id_vendedor = $1
             ORDER BY c.criado_em DESC`,
            [id_usuario]
        );

        return res.status(200).json(rows);
    } catch (error) {
        console.error("ERRO LISTAR CHATS:", error.message);
        return res.status(500).json({
            error: "InternalServerError: Falha ao listar registros combinados da tabela 'Chats'. Motivo: " + error.message,
            message: "Não foi possível carregar as suas conversas no momento."
        });
    }
});


// 📌 3. ENVIAR UMA MENSAGEM NO CHAT (Gera Notificação Automática)
router.post('/chats/:id_chat/mensagens', verificarToken, async (req, res) => {
    const id_chat = Number(req.params.id_chat);
    const conteudo = typeof req.body.conteudo === 'string' ? req.body.conteudo.trim() : '';
    const id_autor = req.usuarioLogado.id;

    if (!Number.isSafeInteger(id_chat) || id_chat <= 0 || !conteudo) {
        return res.status(400).json({
            error: "ValidationError: id_chat inválido ou corpo da mensagem vazio.",
            message: "Informe um chat válido e uma mensagem antes de enviar."
        });
    }

    try {
        const chat = await buscarChatDoUsuario(id_chat, id_autor);
        if (!chat) {
            return res.status(404).json({
                error: "NotFound: Chat não encontrado ou sem acesso.",
                message: "Não foi possível localizar essa conversa."
            });
        }

        // Insere a mensagem na tabela de mensagens
        const { rows } = await BD.query(
            `INSERT INTO Mensagens (id_chat, id_autor, conteudo) 
             VALUES ($1, $2, $3) 
             RETURNING id, id_chat, id_autor, conteudo, enviado_em`,
            [id_chat, id_autor, conteudo]
        );

        const id_destino = Number(id_autor) === Number(chat.id_comprador)
            ? chat.id_vendedor
            : chat.id_comprador;

        await BD.query(
            `INSERT INTO Notificacoes (id_usuario, titulo, mensagem, tipo, id_referencia)
             VALUES ($1, 'Nova mensagem no chat', 'Você tem novas mensagens aguardando resposta.', 'chat', $2)`,
            [id_destino, id_chat]
        );

        return res.status(201).json({
            message: "Mensagem enviada com sucesso.",
            mensagem: rows[0]
        });

    } catch (error) {
        console.error("ERRO ENVIAR MENSAGEM:", error.message);
        return res.status(500).json({
            error: "InternalServerError: Falha ao inserir dados em 'Mensagens'. Motivo: " + error.message,
            message: "Não foi possível enviar a mensagem."
        });
    }
});


// 📌 4. RETORNAR TODAS AS MENSAGENS DE UMA CONVERSA
router.get('/chats/:id_chat/mensagens', verificarToken, async (req, res) => {
    const id_chat = Number(req.params.id_chat);

    if (!Number.isSafeInteger(id_chat) || id_chat <= 0) {
        return res.status(400).json({
            error: "ValidationError: id_chat inválido.",
            message: "Informe um ID de chat válido."
        });
    }

    try {
        const chat = await buscarChatDoUsuario(id_chat, req.usuarioLogado.id);
        if (!chat) {
            return res.status(404).json({
                error: "NotFound: Chat não encontrado ou sem acesso.",
                message: "Não foi possível localizar essa conversa."
            });
        }

        const { rows } = await BD.query(
            `SELECT m.id AS mensagem_id, m.id_autor, m.conteudo, m.enviado_em,
                    perf.nome_completo AS nome_autor
             FROM Mensagens m
             JOIN PerfilTabela perf ON m.id_autor = perf.usuario_id
             WHERE m.id_chat = $1
             ORDER BY m.enviado_em ASC`,
            [id_chat]
        );

        return res.status(200).json(rows);
    } catch (error) {
        console.error("ERRO BUSCAR MENSAGENS:", error.message);
        return res.status(500).json({
            error: "InternalServerError: Erro ao buscar o histórico em 'Mensagens'. Motivo: " + error.message,
            message: "Não foi possível carregar as mensagens desse chat."
        });
    }
});

export default router;