import express from 'express';
import { BD } from '../../db.js';
// IMPORTANTE: Importa o middleware que valida o token JWT
import { verificarToken } from '../../autenticacao.js'; 

const router = express.Router();

// APLICA PROTEÇÃO GLOBAL: A partir daqui, todas as rotas exigem estar logado!
// Se der logout no Swagger, nenhuma rota abaixo vai responder os dados.
router.use(verificarToken);

// 1. LISTAR TODOS OS PRODUTOS (Agora protegida)
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
        return res.status(500).json({ message: 'Erro ao listar produtos' });
    }
});

// 2. BUSCAR PRODUTO POR ID (Agora protegida)
router.get('/:id', async (req, res) => {
    const { id } = req.params;
    try {
        const { rows, rowCount } = await BD.query(
            'SELECT * FROM Produtos WHERE id = $1',
            [id]
        );

        if (rowCount === 0) {
            return res.status(404).json({ message: 'Produto não encontrado' });
        }

        return res.status(200).json(rows[0]);
    } catch (error) {
        console.error('Erro ao buscar produto:', error.message);
        return res.status(500).json({ message: 'Erro ao buscar produto' });
    }
});

// 3. CADASTRAR PRODUTO (Agora protegida)
router.post('/', async (req, res) => {
    const {
        vendedor_id, categoria, nome_produto, marca, unidade, quantidade_disponivel,
        preco, descricao, foto_produto, estado, cidade, localizacao_detalhada, cep, 
        frete, prazo_entrega, tipo_anuncio, destaque
    } = req.body;

    if (!vendedor_id || !categoria || !nome_produto || !quantidade_disponivel || !preco || !estado || !cidade || !cep || !prazo_entrega || !tipo_anuncio) {
        return res.status(400).json({ 
            message: "Por favor, preencha todos os campos obrigatórios do produto." 
        });
    }

    if (tipo_anuncio !== 'Novo' && tipo_anuncio !== 'Seminovo') {
        return res.status(400).json({ 
            message: "O campo 'tipo_anuncio' deve ser estritamente 'Novo' ou 'Seminovo'" 
        });
    }

    try {
        const { rows } = await BD.query(`
            INSERT INTO Produtos (
                vendedor_id, categoria, nome_produto, marca, unidade, quantidade_disponivel, 
                preco, descricao, foto_produto, estado, cidade, localizacao_detalhada, cep, 
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
            message: "Produto cadastrado com sucesso!",
            produto: rows[0]
        });
    } catch (error) {
        console.error('Erro ao cadastrar produto:', error.message);
        if (error.code === '23503') {
            return res.status(400).json({ message: 'O vendedor_id fornecido não existe no sistema.' });
        }
        return res.status(500).json({ message: 'Erro ao cadastrar produto' });
    }
});

// 4. ATUALIZAR PRODUTO POR ID (Agora protegida)
router.put('/:id', async (req, res) => {
    const { id } = req.params;
    const {
        categoria, nome_produto, marca, unidade, quantidade_disponivel,
        preco, descricao, foto_produto, estado, cidade, localizacao_detalhada, cep, 
        frete, prazo_entrega, tipo_anuncio, destaque
    } = req.body;

    if (tipo_anuncio && tipo_anuncio !== 'Novo' && tipo_anuncio !== 'Seminovo') {
        return res.status(400).json({ message: "O campo 'tipo_anuncio' deve ser 'Novo' ou 'Seminovo'" });
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
            return res.status(404).json({ message: "Produto não encontrado" });
        }

        return res.status(200).json({
            message: "Produto atualizado com sucesso!",
            produto: rows[0]
        });
    } catch (error) {
        console.error('Erro ao atualizar produto:', error.message);
        return res.status(500).json({ message: 'Erro ao atualizar produto' });
    }
});

// 5. DELETAR PRODUTO POR ID (Agora protegida)
router.delete('/:id', async (req, res) => {
    const { id } = req.params;

    try {
        const { rows, rowCount } = await BD.query(
            'DELETE FROM Produtos WHERE id = $1 RETURNING *',
            [id]
        );

        if (rowCount === 0) {
            return res.status(404).json({ message: "Produto não encontrado" });
        }

        return res.status(200).json({
            message: "Produto deletado com sucesso!",
            produto: rows[0]
        });
    } catch (error) {
        console.error('Erro ao deletar produto:', error.message);
        return res.status(500).json({ message: 'Erro ao deletar produto' });
    }
});

export default router;