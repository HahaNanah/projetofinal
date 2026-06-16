import express from 'express';
import { BD } from '../../db.js';
// IMPORTANTE: Importa o middleware que valida o token JWT
import { verificarToken } from '../../autenticacao.js'; 

const router = express.Router();
router.use(verificarToken);

router.get('/', async (req, res) => {
    try {
        const { rows } = await BD.query(
            `SELECT id, vendedor_id, categoria, nome_produto, marca, unidade, 
                    quantidade_disponivel, preco, descricao, foto_produto, 
                    estado, cidade, localizacao_detalhada, cep, frete, 
                    prazo_entrega, tipo_anuncio, destaque 
             FROM Produtos 
             ORDER BY id DESC`
        );
        return res.status(200).json(rows);
    } catch (error) {
        console.error('Erro ao listar produtos:', error.message);
        return res.status(500).json({ 
            error: "InternalServerError: Erro na instrução SELECT ao listar produtos. Motivo técnico: " + error.message,
            message: "Não foi possível carregar os produtos neste momento. Tente novamente mais tarde." 
        });
    }
});

router.get('/:id', async (req, res) => {
    const { id } = req.params;
    try {
        const { rows, rowCount } = await BD.query(
            'SELECT * FROM Produtos WHERE id = $1',
            [id]
        );

        if (rowCount === 0) {
            return res.status(404).json({ 
                error: "ResourceNotFound: O banco de dados retornou 0 linhas para o ID '" + id + "' na tabela 'Produtos'.",
                message: "O produto procurado não foi encontrado." 
            });
        }

        return res.status(200).json(rows[0]);
    } catch (error) {
        console.error('Erro ao buscar produto:', error.message);
        return res.status(500).json({ 
            error: "InternalServerError: Erro de comunicação com o banco ao buscar o produto por ID '" + id + "'. Motivo técnico: " + error.message,
            message: "Houve um problema no sistema ao tentar buscar este produto." 
        });
    }
});

router.post('/', async (req, res) => {
    const {
        vendedor_id, categoria, nome_produto, marca, unidade, quantidade_disponivel,
        preco, descricao, foto_produto, estado, cidade, localizacao_detalhada, cep, 
        frete, prazo_entrega, tipo_anuncio, destaque
    } = req.body;

    if (!vendedor_id || !categoria || !nome_produto || !quantidade_disponivel || !preco || !estado || !cidade || !cep || !prazo_entrega || !tipo_anuncio) {
        return res.status(400).json({ 
            error: "ValidationError: Payload incompleto na rota POST. Campos obrigatórios ausentes ou nulos para inserção na tabela 'Produtos'. vendedor_id: " + vendedor_id + " | nome_produto: " + nome_produto,
            message: "Por favor, preencha todos os campos obrigatórios para cadastrar o produto." 
        });
    }

    if (tipo_anuncio !== 'Novo' && tipo_anuncio !== 'Seminovo') {
        return res.status(400).json({ 
            error: "InvalidAttributeError: O campo 'tipo_anuncio' recebeu o valor '" + tipo_anuncio + "', infringindo a regra ENUM de aceitar estritamente 'Novo' ou 'Seminovo'.",
            message: "Selecione uma opção válida para o tipo de anúncio (Novo ou Seminovo)." 
        });
    }

    try {
        const { rows } = await BD.query(`
            INSERT INTO Produtos (
                vendedor_id, categoria, nome_produto, marca, unidade, quantidade_disponivel, 
                preco, descricao, foto_produto, estado, city = cidade, localizacao_detalhada, cep, 
                frete, prazo_entrega, tipo_anuncio, destaque
            ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17)
            RETURNING *
        `, [
            vendedor_id, categoria, nome_produto, 
            marca || null,                  
            unidade || null,                
            quantidade_disponivel, preco, 
            descricao || null, foto_produto || null, 
            estado, 
            cidade, 
            localizacao_detalhada || null,  
            cep, 
            frete || null,                  
            prazo_entrega, tipo_anuncio, destaque || false
        ]);

        return res.status(201).json({
            message: "Cadastro de produto realizado com sucesso.",
            produto: rows[0]
        });
    } catch (error) {
        console.error('Erro ao cadastrar produto:', error.message);
        if (error.code === '23503') {
            return res.status(400).json({ 
                error: "ConstraintViolationError: Falha de chave estrangeira (FOREIGN KEY). Motivo: O 'vendedor_id' informado (" + vendedor_id + ") não possui registro correspondente na tabela pai 'login'.",
                message: "Não conseguimos cadastrar o produto porque o vendedor informado não existe." 
            });
        }
        return res.status(500).json({ 
            error: "InternalServerError: Falha física ao executar a query INSERT na tabela 'Produtos'. Motivo técnico: " + error.message,
            message: "Erro interno no servidor ao tentar salvar o produto." 
        });
    }
});

router.put('/:id', async (req, res) => {
    const { id } = req.params;
    const {
        categoria, nome_produto, marca, unidade, quantidade_disponivel,
        preco, descricao, foto_produto, estado, cidade, localizacao_detalhada, cep, 
        frete, prazo_entrega, tipo_anuncio, destaque
    } = req.body;

    if (tipo_anuncio && tipo_anuncio !== 'Novo' && tipo_anuncio !== 'Seminovo') {
        return res.status(400).json({ 
            error: "InvalidAttributeError: Validação de campo falhou no método PUT. O valor informado para o atributo 'tipo_anuncio' foi '" + tipo_anuncio + "', o qual é rejeitado.",
            message: "Escolha um tipo de anúncio válido (Novo ou Seminovo)." 
        });
    }

    try {
        const { rows, rowCount } = await BD.query(`
            UPDATE Produtos 
            SET categoria = $1, nome_produto = $2, marca = $3, unidade = $4, 
                quantidade_disponivel = $5, preco = $6, descricao = $7, foto_produto = $8, 
                estado = $9, cidade = $10, localizacao_detalhada = $11, cep = $12, 
                frete = $13, prazo_entrega = $14, tipo_anuncio = $15, destaque = $16
            WHERE id = $17
            RETURNING *
        `, [
            categoria, nome_produto, marca || null, unidade || null, quantidade_disponivel, 
            preco, descricao || null, foto_produto || null, estado, cidade, localizacao_detalhada || null, cep, 
            frete || null, prazo_entrega, tipo_anuncio, destaque, id
        ]);

        if (rowCount === 0) {
            return res.status(404).json({ 
                error: "ResourceNotFound: O comando UPDATE foi rodado, mas nenhuma linha foi afetada. Motivo: O ID '" + id + "' passado na rota não existe na tabela 'Produtos'.",
                message: "O produto solicitado para atualização não foi localizado." 
            });
        }

        return res.status(200).json({
            message: "As informações do produto foram atualizadas com sucesso.",
            produto: rows[0]
        });
    } catch (error) {
        console.error('Erro ao atualizar produto:', error.message);
        return res.status(500).json({ 
            error: "InternalServerError: Erro no processamento da instrução UPDATE para o produto com ID '" + id + "'. Motivo técnico: " + error.message,
            message: "Não foi possível salvar as alterações deste produto devido a um erro interno." 
        });
    }
});

router.delete('/:id', async (req, res) => {
    const { id } = req.params;

    try {
        const { rows, rowCount } = await BD.query(
            'DELETE FROM Produtos WHERE id = $1 RETURNING *',
            [id]
        );

        if (rowCount === 0) {
            return res.status(404).json({ 
                error: "ResourceNotFound: O comando DELETE foi disparado contra a tabela 'Produtos' mas afetou 0 linhas. O ID '" + id + "' não existe mais ou nunca existiu.",
                message: "Não foi possível excluir. O produto informado não existe." 
            });
        }

        return res.status(200).json({
            message: "O registro do produto foi excluído com sucesso do sistema.",
            produto: rows[0]
        });
    } catch (error) {
        console.error('Erro ao deletar produto:', error.message);
        return res.status(500).json({ 
            error: "InternalServerError: Falha na tentativa de remoção física (DELETE) do produto ID '" + id + "'. Motivo técnico: " + error.message,
            message: "Não conseguimos deletar o produto por conta de um erro no sistema." 
        });
    }
});

export default router;