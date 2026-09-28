import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { testarConexao } from './db.js';
import documentacao from './config/swagger.js';

import agendamentosRoutes from './src/routes/rotasAgendamentos.js';
import categoriasRoutes from './src/routes/rotasCategorias.js';
import usuariosRoutes from './src/routes/rotasUsuarios.js';
import produtosRoutes from './src/routes/rotasProdutos.js';
import perfilRoutes from './src/routes/rotasPerfil.js'; 

dotenv.config();

const app = express();

// Middlewares obrigatórios
app.use(cors());
app.use(express.json());

// Interface do Swagger HTML
app.get('/swagger', (req, res) => {
    res.send(`<!DOCTYPE html>
<html>
<head>
<title>API ConectaAgro</title>
<meta charset="utf-8"/>
<link rel="stylesheet" href="https://unpkg.com/swagger-ui-dist/swagger-ui.css">
</head>
<body>
<div id="swagger-ui"></div>
<script src="https://unpkg.com/swagger-ui-dist/swagger-ui-bundle.js"></script>
<script>
const ui = SwaggerUIBundle({
    spec: ${JSON.stringify(documentacao)},
    dom_id: '#swagger-ui',
    persistAuthorization: true
});
</script>
</body>
</html>`);
});

// Redireciona a raiz direto para o Swagger
app.get('/', (req, res) => {
    res.redirect('/swagger');
});

// Definição clara dos caminhos da API
app.use('/api/usuarios', usuariosRoutes); // Alterado de '/api' para '/api/usuarios' para evitar conflitos!
app.use('/api/categorias', categoriasRoutes);
app.use('/api/produtos', produtosRoutes);
app.use('/api/agendamentos', agendamentosRoutes);
app.use('/api/perfil', perfilRoutes);

// Inicializa a conexão em segundo plano para não travar o carregamento da Vercel
testarConexao()
  .then(() => console.log("Supabase conectado com sucesso."))
  .catch((erro) => console.error("Aviso de conexão inicial do Banco:", erro.message));

// 🔥 CAPTURADOR DE ERROS GLOBAL (Evita a tela cinzenta 500 da Vercel)
app.use((err, req, res, next) => {
    console.error("CRASH NO SERVIDOR:", err.stack);
    res.status(500).json({
        error: true,
        message: "Ocorreu um erro interno na execução do código.",
        causa: err.message, // Aqui vai te dizer se o erro foi tabela inexistente, erro de token, etc.
        local: err.stack ? err.stack.split('\n')[1].trim() : "Desconhecido"
    });
});

export default app;