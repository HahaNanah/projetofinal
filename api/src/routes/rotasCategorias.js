import express from 'express';
import { BD } from '../../db.js';
// IMPORTANTE: Importa o middleware que valida o token JWT
import { verificarToken } from '../../autenticacao.js'; 

const router = express.Router();

// APLICA PROTEÇÃO GLOBAL: Se der logout no Swagger, ninguém acessa ou altera as categorias!
router.use(verificarToken);

// 1. LISTAR TODAS AS CATEGORIAS
router.get('/', async (req, res) => {
    try {
        const resultado = await BD.query(
            'SELECT id, nome_categoria FROM Categorias ORDER BY id ASC'
        );
        res.json(resultado.rows);
    } catch (erro) {
        console.error("Erro ao buscar categorias:", erro.message);
        res.status(500).json({ erro: "Erro ao buscar categorias no banco de dados." });
    }
});

// 2. CRIAR NOVA CATEGORIA
router.post('/', async (req, res) => {
    const { nome_categoria } = req.body;

    if (!nome_categoria) {
        return res.status(400).json({ erro: "O campo 'nome_categoria' é obrigatório." });
    }

    try {
        const novoRegistro = await BD.query(
            `INSERT INTO Categorias (nome_categoria) VALUES ($1) RETURNING *`,
            [nome_categoria]
        );
        res.status(201).json({ 
            mensagem: "Categoria criada com sucesso!", 
            dados: novoRegistro.rows[0] 
        });
    } catch (erro) {
        console.error("Erro ao criar categoria:", erro.message);
        if (erro.code === '23505') { 
            return res.status(400).json({ erro: "Esta categoria já existe." });
        }
        res.status(500).json({ erro: "Erro ao criar categoria no banco." });
    }
});

// 3. ATUALIZAR CATEGORIA TOTAL (PUT)
router.put('/:id', async (req, res) => {
    const { id } = req.params;
    const { nome_categoria } = req.body;

    if (!nome_categoria) {
        return res.status(400).json({ erro: "O campo 'nome_categoria' é obrigatório." });
    }

    try {
        const atualizado = await BD.query(
            `UPDATE Categorias SET nome_categoria = $1 WHERE id = $2 RETURNING *`,
            [nome_categoria, id]
        );
        
        if (atualizado.rows.length === 0) {
            return res.status(404).json({ erro: "Categoria não encontrada." });
        }

        res.json({ mensagem: "Categoria atualizada com sucesso!", dados: atualizado.rows[0] });
    } catch (erro) {
        console.error("Erro ao atualizar categoria:", erro.message);
        res.status(500).json({ erro: "Erro ao atualizar categoria." });
    }
});

// 4. ATUALIZAR CATEGORIA PARCIAL (PATCH)
router.patch('/:id', async (req, res) => {
    const { id } = req.params;
    const { nome_categoria } = req.body;

    if (nome_categoria !== undefined && !nome_categoria) {
        return res.status(400).json({ erro: "O campo 'nome_categoria' não pode ser vazio." });
    }

    try {
        const atualizado = await BD.query(
            `UPDATE Categorias SET nome_categoria = COALESCE($1, nome_categoria) WHERE id = $2 RETURNING *`,
            [nome_categoria, id]
        );

        if (atualizado.rows.length === 0) {
            return res.status(404).json({ erro: "Categoria não encontrada." });
        }

        // CORRIGIDO: mudado de updated.rows[0] para atualizado.rows[0]
        res.json({ mensagem: "Categoria modificada parcialmente com sucesso!", dados: atualizado.rows[0] });
    } catch (erro) {
        console.error("Erro ao modificar parcial de categoria:", erro.message);
        res.status(500).json({ erro: "Erro ao atualizar categoria." });
    }
});

// 5. DELETAR CATEGORIA
router.delete('/:id', async (req, res) => {
    const { id } = req.params;

    try {
        const resultado = await BD.query(
            'DELETE FROM Categorias WHERE id = $1 RETURNING *', 
            [id]
        );

        if (resultado.rows.length === 0) {
            return res.status(404).json({ erro: "Categoria não encontrada." });
        }

        res.json({ mensagem: `Categoria com ID ${id} deletada com sucesso!` });
    } catch (erro) {
        console.error("Erro ao deletar categoria:", erro.message);
        res.status(500).json({ erro: "Erro ao deletar categoria." });
    }
});

export default router;