import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { testarConexao } from './db.js';
import documentacao from './config/swagger.js';

import agendamentosRoutes from './src/routes/rotasAgendamentos.js';
import categoriasRoutes from './src/routes/rotasCategorias.js';
import loginRoutes from './src/routes/rotasLogin.js';
import produtosRoutes from './src/routes/rotasProdutos.js';
import perfilRoutes from './src/routes/rotasPerfil.js'; 
//import anunciosRoutes from './src/routes/rotasAnuncios.js'; 
//import vendasRoutes from './src/routes/rotasVendas.js';
//import chatsRoutes from './src/routes/rotasChats.js';

dotenv.config();

const app = express();

// Middlewares
app.use(cors());
app.use(express.json());

// Swagger
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

// Rota raiz
app.get('/', (req, res) => {
    res.redirect('/swagger');
});

// Rotas
app.use('/api', loginRoutes);
app.use('/api/categorias', categoriasRoutes);
app.use('/api/produtos', produtosRoutes);
app.use('/api/agendamentos', agendamentosRoutes);
app.use('/api/perfil', perfilRoutes);
//app.use('/api', anunciosRoutes);
//app.use('/api', vendasRoutes);
//app.use('/api', chatsRoutes);

// 🔥 IMPORTANTE: SEM app.listen no Vercel
testarConexao()
  .then(() => console.log("Banco conectado"))
  .catch((erro) => console.error("Erro no banco:", erro.message));

export default app;