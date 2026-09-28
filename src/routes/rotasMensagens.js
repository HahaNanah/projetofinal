import { Router } from "express";
import { BD } from "../../db.js";
import { verificarToken } from "../../autenticacao.js";

const router = Router();

router.use(verificarToken);

async function buscarChatDoUsuario(idChat, usuarioId) {
    const { rows } = await BD.query(
        `SELECT id FROM Chats
         WHERE id = $1 AND (id_comprador = $2 OR id_vendedor = $2)`,
        [idChat, usuarioId]
    );

    return rows[0];
}

router.get("/:id_chat", async (req, res) => {
    const idChat = Number(req.params.id_chat);

    if (!Number.isSafeInteger(idChat) || idChat <= 0) {
        return res.status(400).json({ message: "id_chat inválido." });
    }

    try {
        const chat = await buscarChatDoUsuario(idChat, req.usuarioLogado.id);
        if (!chat) {
            return res.status(404).json({ message: "Chat não encontrado ou sem acesso." });
        }

        const { rows } = await BD.query(
            `SELECT m.id AS mensagem_id, m.id_chat, m.id_autor,
                    p.nome_completo AS nome_autor, m.conteudo, m.enviado_em
             FROM Mensagens m
             LEFT JOIN PerfilTabela p ON p.usuario_id = m.id_autor
             WHERE m.id_chat = $1
             ORDER BY m.enviado_em ASC`,
            [idChat]
        );

        return res.status(200).json(rows);
    } catch (error) {
        console.error("Erro ao buscar mensagens:", error.message);
        return res.status(500).json({ message: "Erro ao buscar mensagens." });
    }
});

router.post("/", async (req, res) => {
    const idChat = Number(req.body.id_chat);
    const conteudo = typeof req.body.conteudo === "string" ? req.body.conteudo.trim() : "";

    if (!Number.isSafeInteger(idChat) || idChat <= 0 || !conteudo) {
        return res.status(400).json({
            message: "id_chat válido e conteudo são obrigatórios."
        });
    }

    try {
        const chat = await buscarChatDoUsuario(idChat, req.usuarioLogado.id);
        if (!chat) {
            return res.status(404).json({ message: "Chat não encontrado ou sem acesso." });
        }

        const { rows } = await BD.query(
            `INSERT INTO Mensagens (id_chat, id_autor, conteudo)
             VALUES ($1, $2, $3)
             RETURNING id, id_chat, id_autor, conteudo, enviado_em`,
            [idChat, req.usuarioLogado.id, conteudo]
        );

        return res.status(201).json({
            message: "Mensagem enviada com sucesso.",
            dados: rows[0]
        });
    } catch (error) {
        console.error("Erro ao enviar mensagem:", error.message);
        return res.status(500).json({ message: "Erro ao enviar mensagem." });
    }
});

export default router;