import express from 'express';
import { BD } from '../../db.js';
// IMPORTANTE: Importa o middleware que valida o token JWT
import { verificarToken } from '../../autenticacao.js'; 

const router = express.Router();

// APLICA PROTEÇÃO GLOBAL: Se der logout no Swagger, ninguém acessa ou altera as categorias!
router.use(verificarToken);

// ==========================================
// 🔍 1. LISTAR TODAS AS CATEGORIAS
// ==========================================
router.get('/', async (req, res) => {
    try {
        const resultado = await BD.query(
            'SELECT id, nome_categoria FROM Categorias ORDER BY id ASC'
        );
        return res.status(200).json(resultado.rows);
    } catch (erro) {
        console.error("Erro ao buscar categorias:", erro.message);
        return res.status(500).json({ 
            error: "InternalServerError: Falha na execução do comando SELECT. Motivo técnico: " + erro.message + " | Contexto: Ocorreu um problema ao tentar ler todos os registros da tabela 'Categorias'.",
            message: "Não foi possível carregar as categorias. Tente novamente mais tarde." 
        });
    }
});

// ==========================================
// ➕ 2. CRIAR NOVA CATEGORIA
// ==========================================
router.post('/', async (req, res) => {
    const { nome_categoria } = req.body;

    if (!nome_categoria) {
        return res.status(400).json({ 
            error: "ValidationError: O corpo da requisição falhou na validação de dados. Motivo: O atributo 'nome_categoria' veio nulo ou indefinido (" + nome_categoria + "), impedindo a persistência do registro.",
            message: "Por favor, informe o nome da categoria." 
        });
    }

    try {
        const novoRegistro = await BD.query(
            `INSERT INTO Categorias (nome_categoria) VALUES ($1) RETURNING *`,
            [nome_categoria]
        );
        return res.status(201).json({ 
            message: "Categoria registrada com sucesso.", 
            dados: novoRegistro.rows[0] 
        });
    } catch (erro) {
        console.error("Erro ao criar categoria:", erro.message);
        if (erro.code === '23505') { 
            return res.status(400).json({ 
                error: "ConflictError: Violação da constraint de unicidade (UNIQUE). Motivo: A categoria com o nome '" + nome_categoria + "' já existe cadastrada no banco de dados.",
                message: "Já existe uma categoria cadastrada com esse nome." 
            });
        }
        return res.status(500).json({ 
            error: "InternalServerError: Erro ao executar a instrução INSERT. Motivo técnico: " + erro.message + " | Payload enviado: " + nome_categoria,
            message: "Não conseguimos salvar a nova categoria devido a uma falha no sistema." 
        });
    }
});

// ==========================================
// ✏️ 3. ATUALIZAR CATEGORIA TOTAL (PUT)
// ==========================================
router.put('/:id', async (req, res) => {
    const { id } = req.params;
    const { nome_categoria } = req.body;

    if (!nome_categoria) {
        return res.status(400).json({ 
            error: "ValidationError: Falha na validação do método PUT. Motivo: O campo 'nome_categoria' é obrigatório para atualizações completas e foi enviado vazio ou ausente (" + nome_categoria + ").",
            message: "O nome da categoria não pode ficar em branco para atualização." 
        });
    }

    try {
        const atualizado = await BD.query(
            `UPDATE Categorias SET nome_categoria = $1 WHERE id = $2 RETURNING *`,
            [nome_categoria, id]
        );
        
        if (atualizado.rows.length === 0) {
            return res.status(404).json({ 
                error: "ResourceNotFound: O comando UPDATE foi concluído, mas afetou 0 linhas. Motivo: O identificador de categoria ID '" + id + "' não foi encontrado na tabela 'Categorias'.",
                message: "A categoria que você tentou alterar não existe no sistema." 
            });
        }

        return res.status(200).json({ 
            message: "Categoria atualizada com sucesso.", 
            dados: atualizado.rows[0] 
        });
    } catch (erro) {
        console.error("Erro ao atualizar categoria:", erro.message);
        return res.status(500).json({ 
            error: "InternalServerError: Erro no tratamento da requisição PUT no banco de dados. Motivo técnico: " + erro.message + " | ID afetado: " + id,
            message: "Houve um problema ao salvar as modificações da categoria." 
        });
    }
});

// ==========================================
// ✏️ 4. ATUALIZAR CATEGORIA PARCIAL (PATCH)
// ==========================================
router.patch('/:id', async (req, res) => {
    const { id } = req.params;
    const { nome_categoria } = req.body;

    if (nome_categoria !== undefined && !nome_categoria) {
        return res.status(400).json({ 
            error: "ValidationError: Validação falhou no método PATCH. Motivo: O campo 'nome_categoria' foi explicitamente enviado no payload, porém com conteúdo nulo ou vazio (" + nome_categoria + ").",
            message: "O novo nome da categoria não pode ser vazio." 
        });
    }

    try {
        const atualizado = await BD.query(
            `UPDATE Categorias SET nome_categoria = COALESCE($1, nome_categoria) WHERE id = $2 RETURNING *`,
            [nome_categoria, id]
        );

        if (atualizado.rows.length === 0) {
            return res.status(404).json({ 
                error: "ResourceNotFound: Atualização parcial falhou. Motivo: O ID '" + id + "' fornecido no parâmetro da rota não existe na tabela 'Categorias'.",
                message: "Não encontramos a categoria para aplicar a alteração parcial." 
            });
        }

        return res.status(200).json({ 
            message: "Categoria modificada parcialmente com sucesso.", 
            dados: atualizado.rows[0] 
        });
    } catch (erro) {
        console.error("Erro ao modificar parcial de categoria:", erro.message);
        return res.status(500).json({ 
            error: "InternalServerError: Falha na execução da cláusula UPDATE com COALESCE. Motivo técnico: " + erro.message + " | Parâmetro ID usado: " + id,
            message: "Não foi possível atualizar a categoria neste momento." 
        });
    }
});

// ==========================================
// ❌ 5. DELETAR CATEGORIA
// ==========================================
router.delete('/:id', async (req, res) => {
    const { id } = req.params;

    try {
        const resultado = await BD.query(
            'DELETE FROM Categorias WHERE id = $1 RETURNING *', 
            [id]
        );

        if (resultado.rows.length === 0) {
            return res.status(404).json({ 
                error: "ResourceNotFound: O comando DELETE foi enviado, mas nenhuma linha foi removida. Motivo: Não existe nenhum registro com o ID '" + id + "' na tabela 'Categorias'.",
                message: "A categoria informada não foi localizada ou já foi excluída." 
            });
        }

        return res.status(200).json({ 
            message: "O registro da categoria especificada foi removido com sucesso." 
        });
    } catch (erro) {
        console.error("Erro ao deletar categoria:", erro.message);
        return res.status(500).json({ 
            error: "InternalServerError: Erro no processamento da instrução DELETE no banco de dados. Motivo técnico: " + erro.message + " | Tentativa falha no ID: " + id,
            message: "Não foi possível excluir a categoria selecionada devido a um erro no sistema." 
        });
    }
});

export default router;