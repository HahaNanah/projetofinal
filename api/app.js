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

dotenv.config();

const app = express();

// Middlewares globais
app.use(cors());
app.use(express.json());

// Rota da documentação do Swagger
app.get('/swagger', (req, res) => {
    res.send(`<!DOCTYPE html>
<html>
<head>
<title>API Agricultura - FinanControl</title>
<meta charset="utf-8"/>
<link rel="stylesheet" href="https://unpkg.com/swagger-ui-dist/swagger-ui.css">
</head>
<body>
<div id="swagger-ui"></div>
<script src="https://unpkg.com/swagger-ui-dist/swagger-ui-bundle.js"></script>
<script>
(function(){
    // COMENTADO: Removemos a limpeza automática para o Swagger não apagar seu token no F5
    /*
    try {
        for (const key of Object.keys(window.localStorage || {})) {
            if (/swagger|authorization|bearer|auth/i.test(key)) window.localStorage.removeItem(key);
        }
        for (const key of Object.keys(window.sessionStorage || {})) {
            if (/swagger|authorization|bearer|auth/i.test(key)) window.sessionStorage.removeItem(key);
        }
    } catch (e) {
        // ignore
    }
    */

    const ui = SwaggerUIBundle({
        spec: ${JSON.stringify(documentacao)},
        dom_id: '#swagger-ui',
        persistAuthorization: true // ALTERADO: Agora o Swagger guarda o seu Token entre os testes!
    });

    return ui;
})();
</script>
</body>
</html>`);
});

// Redireciona a rota raiz para o Swagger
app.get('/', (req, res) => {
    res.redirect('/swagger');
});

// Rotas da API
app.use('/api', loginRoutes);                  // Rota de autenticação (Login/Cadastro) e gerenciamento de usuários
app.use('/api/categorias', categoriasRoutes); // Rota pública de categorias
app.use('/api/produtos', produtosRoutes);     // Rota pública de produtos
app.use('/api/agendamentos', agendamentosRoutes);           // Rotas de agendamentos (Devem conter o middleware de JWT internamente)
app.use('/api/perfil', perfilRoutes);                 // Rotas de perfil (Devem conter o middleware de JWT internamente)

const porta = 3000;

// Inicialização do servidor e banco de dados
app.listen(porta, async () => {
    console.log(`Servidor rodando liso em http://localhost:${porta}`);
    try {
        await testarConexao();
        console.log("Conexão com o PostgreSQL estabelecida com sucesso!");
    } catch (erro) {
        console.error("Falha crítica ao conectar no banco de dados:", erro.message);
    }
});

export default app;