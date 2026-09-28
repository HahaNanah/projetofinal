
 
// ---------- helpers para reduzir repetição ----------
const ref = (nome) => ({ $ref: `#/components/schemas/${nome}` });
const json = (schema) => ({ "application/json": { schema } });
const corpo = (schema) => ({ required: true, content: json(schema) });
const resposta = (description, schema) =>
    schema ? { description, content: json(schema) } : { description };
const erro = (description) => resposta(description, ref("Erro"));
const idPath = (name, description) => ({
    name, in: "path", required: true, schema: { type: "integer" }, description
});
 
const R401 = erro("Token ausente ou inválido.");
const R500 = erro("Erro interno no servidor.");
 
const documentacao = {
    openapi: "3.0.3",
    info: {
        title: "API Site de Agricultura",
        description: "API para gerenciamento de usuários, perfis, produtos, anúncios, categorias, agendamentos, vendas e chats.",
        version: "1.1.0"
    },
    servers: [
        { url: "https://projetofinal-teal.vercel.app/api", description: "Servidor de Produção Vercel" }
    ],
    components: {
        securitySchemes: {
            bearerAuth: {
                type: "http",
                scheme: "bearer",
                bearerFormat: "JWT",
                description: "Token JWT gerado no login. Cole APENAS o token (o Swagger adiciona o 'Bearer ' automaticamente)."
            }
        },
        schemas: {
            Erro: {
                type: "object",
                properties: {
                    error: { type: "string", example: "ValidationError: parâmetros obrigatórios ausentes." },
                    message: { type: "string", example: "Mensagem amigável para o usuário." }
                }
            },
            Usuario: {
                type: "object",
                properties: {
                    id: { type: "integer", example: 1 },
                    email: { type: "string", example: "vendedor@email.com" },
                    tipo_usuario: { type: "string", enum: ["vendedor", "comprador"], example: "vendedor" }
                }
            },
            UsuarioInput: {
                type: "object",
                required: ["email", "senha", "tipo_usuario"],
                properties: {
                    email: { type: "string", example: "comprador@email.com" },
                    senha: { type: "string", example: "123" },
                    tipo_usuario: { type: "string", enum: ["vendedor", "comprador"], example: "comprador" }
                }
            },
            Perfil: {
                type: "object",
                properties: {
                    usuario_id: { type: "integer", example: 2 },
                    email: { type: "string", example: "vendedor@email.com", description: "Retornado apenas no GET /perfil." },
                    nome_completo: { type: "string", example: "João da Silva" },
                    telefone: { type: "string", example: "(18) 99999-1111" },
                    nome_fazenda_ou_empresa: { type: "string", example: "Fazenda Boa Vista" },
                    cpf_cnpj: { type: "string", example: "12.345.678/0001-99" },
                    tipo_usuario: { type: "string", example: "vendedor" }
                }
            },
            PerfilInput: {
                type: "object",
                required: ["nome_completo", "tipo_usuario"],
                properties: {
                    nome_completo: { type: "string", example: "João da Silva" },
                    telefone: { type: "string", example: "(18) 99999-1111" },
                    nome_fazenda_ou_empresa: { type: "string", example: "Fazenda Boa Vista" },
                    cpf_cnpj: { type: "string", example: "12.345.678/0001-99" },
                    tipo_usuario: { type: "string", enum: ["vendedor", "comprador"], example: "vendedor" }
                }
            },
            ProdutoInput: {
                type: "object",
                properties: {
                    vendedor_id: { type: "integer", example: 2, description: "Opcional. Se enviado, precisa ser igual ao ID do token (senão 403). O produto é sempre gravado com o ID do token." },
                    categoria: { type: "string", example: "Rações" },
                    nome_produto: { type: "string", example: "Ração para Bovinos de Leite 22%" },
                    marca: { type: "string", example: "Nutribon" },
                    unidade: { type: "string", example: "Saco 40kg" },
                    quantidade_disponivel: { type: "integer", example: 80 },
                    preco: { type: "number", example: 125.0 },
                    descricao: { type: "string", example: "Ração com 22% de proteína bruta." },
                    foto_produto: { type: "string", example: "https://link.com/foto.jpg" },
                    estado: { type: "string", example: "São Paulo" },
                    cidade: { type: "string", example: "Andradina" },
                    localizacao_detalhada: { type: "string", example: "Fazenda Boa Vista, Estrada do Campo, Km 12" },
                    cep: { type: "string", example: "16900-000" },
                    frete: { type: "string", example: "Transportadora parceira" },
                    prazo_entrega: { type: "string", example: "5 dias úteis" },
                    tipo_anuncio: { type: "string", enum: ["Novo", "Seminovo"], example: "Novo" },
                    destaque: { type: "boolean", example: false }
                }
            },
            Produto: {
                type: "object",
                properties: {
                    id: { type: "integer", example: 1 },
                    vendedor_id: { type: "integer", example: 2 },
                    categoria: { type: "string", example: "Gados" },
                    nome_produto: { type: "string", example: "Garrote Nelore PO" },
                    marca: { type: "string", nullable: true },
                    unidade: { type: "string", nullable: true },
                    quantidade_disponivel: { type: "integer", example: 15 },
                    preco: { type: "number", example: 3200.0 },
                    descricao: { type: "string", nullable: true },
                    foto_produto: { type: "string", nullable: true },
                    estado: { type: "string", example: "Mato Grosso" },
                    cidade: { type: "string", example: "Rondonópolis" },
                    localizacao_detalhada: { type: "string", nullable: true },
                    cep: { type: "string", example: "78700-000" },
                    frete: { type: "string", nullable: true },
                    prazo_entrega: { type: "string", example: "5 dias úteis" },
                    tipo_anuncio: { type: "string", enum: ["Novo", "Seminovo"] },
                    destaque: { type: "boolean", example: false }
                }
            },
            Categoria: {
                type: "object",
                properties: {
                    id: { type: "integer", example: 1 },
                    nome_categoria: { type: "string", example: "Maquinários" }
                }
            },
            AnuncioInput: {
                type: "object",
                required: ["categoria", "titulo", "preco"],
                properties: {
                    categoria: { type: "string", example: "Máquinas" },
                    titulo: { type: "string", example: "Trator Massey Ferguson 2024" },
                    preco: { type: "number", example: 245000.0 },
                    quantidade_disponivel: { type: "integer", example: 1, description: "Padrão: 1" },
                    descricao: { type: "string", example: "Trator com 200 horas de uso." },
                    foto_produto: { type: "string", example: "https://link.com/foto.jpg" },
                    status: { type: "string", example: "Ativo", description: "Padrão: Ativo. A listagem só mostra anúncios 'Ativo'." }
                }
            },
            Anuncio: {
                type: "object",
                properties: {
                    id: { type: "integer", example: 10 },
                    vendedor_id: { type: "integer", example: 2 },
                    categoria: { type: "string", example: "Máquinas" },
                    titulo: { type: "string", example: "Trator Massey Ferguson 2024" },
                    preco: { type: "number", example: 245000.0 },
                    quantidade_disponivel: { type: "integer", example: 1 },
                    descricao: { type: "string", nullable: true },
                    foto_produto: { type: "string", nullable: true },
                    status: { type: "string", example: "Ativo" },
                    criado_em: { type: "string", format: "date-time" },
                    nome_vendedor: { type: "string", example: "João da Silva" },
                    nome_fazenda_ou_empresa: { type: "string", example: "Fazenda Boa Vista" },
                    telefone: { type: "string", description: "Apenas no GET /anuncios/{id}." }
                }
            },
            VendaInput: {
                type: "object",
                required: ["id_anuncio", "id_vendedor", "valor_total"],
                properties: {
                    id_anuncio: { type: "integer", example: 10 },
                    id_vendedor: { type: "integer", example: 2 },
                    quantidade_comprada: { type: "integer", example: 1, description: "Padrão: 1" },
                    valor_total: { type: "number", example: 245000.0 },
                    status_pagamento: { type: "string", example: "Pendente", description: "Padrão: Pendente" },
                    status_entrega: { type: "string", example: "Processando", description: "Padrão: Processando" }
                }
            },
            Venda: {
                type: "object",
                properties: {
                    id: { type: "integer", example: 5 },
                    id_anuncio: { type: "integer", example: 10 },
                    id_comprador: { type: "integer", example: 48, description: "Vem do token." },
                    id_vendedor: { type: "integer", example: 2 },
                    quantidade_comprada: { type: "integer", example: 1 },
                    valor_total: { type: "number", example: 245000.0 },
                    status_pagamento: { type: "string", example: "Pendente" },
                    status_entrega: { type: "string", example: "Processando" },
                    data_venda: { type: "string", format: "date-time" },
                    nome_anuncio: { type: "string", description: "Apenas nas listagens." },
                    nome_vendedor: { type: "string", description: "Apenas em /vendas/compras." },
                    nome_comprador: { type: "string", description: "Apenas em /vendas/pedidos." }
                }
            },
            Chat: {
                type: "object",
                properties: {
                    id: { type: "integer", example: 3 },
                    id_produto: { type: "integer", example: 4 },
                    id_comprador: { type: "integer", example: 48 },
                    id_vendedor: { type: "integer", example: 2 },
                    criado_em: { type: "string", format: "date-time" }
                }
            },
            ChatLista: {
                type: "object",
                properties: {
                    chat_id: { type: "integer", example: 3 },
                    criado_em: { type: "string", format: "date-time" },
                    nome_produto: { type: "string", example: "Ração para Bovinos de Leite 22%" },
                    foto_produto: { type: "string", nullable: true },
                    nome_comprador: { type: "string", example: "Carlos Souza" },
                    nome_vendedor: { type: "string", example: "João da Silva" }
                }
            },
            Mensagem: {
                type: "object",
                properties: {
                    id: { type: "integer", example: 20 },
                    id_chat: { type: "integer", example: 3 },
                    id_autor: { type: "integer", example: 48 },
                    conteudo: { type: "string", example: "Olá, ainda está disponível?" },
                    enviado_em: { type: "string", format: "date-time" }
                }
            },
            MensagemLista: {
                type: "object",
                properties: {
                    mensagem_id: { type: "integer", example: 20 },
                    id_autor: { type: "integer", example: 48 },
                    conteudo: { type: "string", example: "Olá, ainda está disponível?" },
                    enviado_em: { type: "string", format: "date-time" },
                    nome_autor: { type: "string", example: "Carlos Souza" }
                }
            },
            Agendamento: {
                type: "object",
                properties: {
                    id: { type: "integer", example: 12 },
                    id_comprador: { type: "integer", example: 48 },
                    id_produto: { type: "integer", example: 4 },
                    status_agendamento: { type: "string", example: "Pendente" },
                    data_agendamento: { type: "string", format: "date-time" },
                    observacoes: { type: "string", example: "Quero combinar a entrega da ração." }
                }
            },
            AgendamentoLista: {
                type: "object",
                properties: {
                    agendamento_id: { type: "integer", example: 1 },
                    nome_comprador: { type: "string", example: "Carlos Souza" },
                    nome_produto: { type: "string", example: "Ração para Bovinos de Leite 22%" },
                    preco: { type: "number", example: 125.0 },
                    data_agendamento: { type: "string", format: "date-time" },
                    status_agendamento: { type: "string", example: "Pendente" },
                    observacoes: { type: "string", example: "Quero combinar a entrega da ração." }
                }
            }
        }
    },
    security: [{ bearerAuth: [] }],
    tags: [
        { name: "Usuários", description: "Cadastro, login e gerenciamento de usuários" },
        { name: "Perfil", description: "Informações do perfil do usuário logado" },
        { name: "Produtos", description: "Catálogo de produtos" },
        { name: "Anúncios", description: "Anúncios publicados pelos vendedores" },
        { name: "Categorias", description: "Categorias de produtos" },
        { name: "Agendamentos", description: "Visitas e negociações de produtos" },
        { name: "Vendas", description: "Compras e pedidos recebidos" },
        { name: "Chats", description: "Conversas entre comprador e vendedor" }
    ],
    paths: {
        // ==================== USUÁRIOS ====================
        "/usuarios/login": {
            post: {
                tags: ["Usuários"],
                summary: "Autentica o usuário e retorna o JWT",
                security: [],
                requestBody: corpo(ref("UsuarioInput")),
                responses: {
                    200: resposta("Autenticação efetuada com sucesso.", {
                        type: "object",
                        properties: {
                            message: { type: "string", example: "Autenticação efetuada com sucesso." },
                            usuario: ref("Usuario"),
                            token: { type: "string", example: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..." }
                        }
                    }),
                    400: erro("E-mail, senha ou tipo de usuário não informados."),
                    401: erro("E-mail/tipo de usuário ou senha incorretos."),
                    500: R500
                }
            }
        },
        "/usuarios": {
            get: {
                tags: ["Usuários"],
                summary: "Lista todos os usuários",
                responses: {
                    200: resposta("Lista de usuários.", { type: "array", items: ref("Usuario") }),
                    401: R401,
                    500: R500
                }
            },
            post: {
                tags: ["Usuários"],
                summary: "Cadastra um novo usuário",
                security: [],
                requestBody: corpo(ref("UsuarioInput")),
                responses: {
                    201: resposta("Registro de usuário realizado com sucesso.", {
                        type: "object",
                        properties: {
                            message: { type: "string", example: "Registro de usuário realizado com sucesso." },
                            usuario: ref("Usuario")
                        }
                    }),
                    400: erro("Campos obrigatórios ausentes ou e-mail já cadastrado."),
                    500: R500
                }
            }
        },
        "/usuarios/{id}": {
            put: {
                tags: ["Usuários"],
                summary: "Atualiza um usuário por ID",
                parameters: [idPath("id", "ID do usuário")],
                requestBody: corpo(ref("UsuarioInput")),
                responses: {
                    200: resposta("Dados atualizados.", {
                        type: "object",
                        properties: { message: { type: "string" }, usuario: ref("Usuario") }
                    }),
                    401: R401,
                    404: erro("Usuário não encontrado."),
                    500: R500
                }
            },
            delete: {
                tags: ["Usuários"],
                summary: "Exclui permanentemente um usuário por ID",
                parameters: [idPath("id", "ID do usuário")],
                responses: {
                    200: resposta("Usuário excluído permanentemente.", {
                        type: "object", properties: { message: { type: "string" } }
                    }),
                    401: R401,
                    404: erro("Usuário não encontrado."),
                    500: R500
                }
            }
        },
 
        // ==================== PERFIL ====================
        "/perfil": {
            get: {
                tags: ["Perfil"],
                summary: "Busca o perfil do usuário logado (ID vem do token)",
                responses: {
                    200: resposta("Perfil retornado.", ref("Perfil")),
                    401: R401,
                    404: erro("Perfil não encontrado."),
                    500: R500
                }
            },
            post: {
                tags: ["Perfil"],
                summary: "Cria o perfil do usuário logado (vinculado ao token)",
                requestBody: corpo(ref("PerfilInput")),
                responses: {
                    201: resposta("Perfil criado com sucesso!", {
                        type: "object", properties: { message: { type: "string" }, perfil: ref("Perfil") }
                    }),
                    400: erro("Campos obrigatórios ausentes ou perfil já cadastrado."),
                    401: R401,
                    500: R500
                }
            },
            put: {
                tags: ["Perfil"],
                summary: "Atualiza o perfil do usuário logado (ID vem do token)",
                requestBody: corpo(ref("PerfilInput")),
                responses: {
                    200: resposta("Perfil atualizado com sucesso!", {
                        type: "object", properties: { message: { type: "string" }, perfil: ref("Perfil") }
                    }),
                    400: erro("Campos obrigatórios ausentes."),
                    401: R401,
                    404: erro("Perfil não encontrado para atualização."),
                    500: R500
                }
            }
        },
        "/perfil/{usuario_id}": {
            put: {
                tags: ["Perfil"],
                summary: "Atualiza o perfil informando o ID (deve ser o do próprio usuário)",
                parameters: [idPath("usuario_id", "ID do usuário (precisa ser igual ao do token)")],
                requestBody: corpo(ref("PerfilInput")),
                responses: {
                    200: resposta("Perfil atualizado com sucesso!", {
                        type: "object", properties: { message: { type: "string" }, perfil: ref("Perfil") }
                    }),
                    400: erro("usuario_id inválido ou campos obrigatórios ausentes."),
                    401: R401,
                    403: erro("Só é possível alterar o próprio perfil."),
                    404: erro("Perfil não encontrado para atualização."),
                    500: R500
                }
            }
        },
 
        // ==================== PRODUTOS ====================
        "/produtos": {
            get: {
                tags: ["Produtos"],
                summary: "Lista todos os produtos",
                responses: {
                    200: resposta("Lista de produtos.", { type: "array", items: ref("Produto") }),
                    401: R401,
                    500: R500
                }
            },
            post: {
                tags: ["Produtos"],
                summary: "Cadastra um produto (apenas contas que não sejam 'comprador')",
                description: "Obrigatórios: categoria, nome_produto, quantidade_disponivel, preco, estado, cidade, cep, prazo_entrega e tipo_anuncio.",
                requestBody: {
                    required: true,
                    content: json({
                        allOf: [ref("ProdutoInput")],
                        required: ["categoria", "nome_produto", "quantidade_disponivel", "preco", "estado", "cidade", "cep", "prazo_entrega", "tipo_anuncio"]
                    })
                },
                responses: {
                    201: resposta("Cadastro de produto realizado com sucesso.", {
                        type: "object", properties: { message: { type: "string" }, produto: ref("Produto") }
                    }),
                    400: erro("Campos obrigatórios ausentes, tipo_anuncio inválido ou vendedor não localizado."),
                    401: R401,
                    403: erro("Conta 'comprador' não pode anunciar, ou vendedor_id diferente do token."),
                    500: R500
                }
            }
        },
        "/produtos/{id}": {
            get: {
                tags: ["Produtos"],
                summary: "Busca um produto pelo ID",
                parameters: [idPath("id", "ID do produto")],
                responses: {
                    200: resposta("Produto encontrado.", ref("Produto")),
                    401: R401,
                    404: erro("Produto não encontrado."),
                    500: R500
                }
            },
            put: {
                tags: ["Produtos"],
                summary: "Atualiza um produto por ID",
                description: "Atenção: o servidor não verifica se o produto pertence ao usuário logado.",
                parameters: [idPath("id", "ID do produto")],
                requestBody: corpo(ref("ProdutoInput")),
                responses: {
                    200: resposta("As informações do produto foram atualizadas com sucesso.", {
                        type: "object", properties: { message: { type: "string" }, produto: ref("Produto") }
                    }),
                    400: erro("tipo_anuncio inválido."),
                    401: R401,
                    404: erro("Produto não encontrado."),
                    500: R500
                }
            },
            delete: {
                tags: ["Produtos"],
                summary: "Exclui um produto por ID",
                description: "Atenção: o servidor não verifica se o produto pertence ao usuário logado.",
                parameters: [idPath("id", "ID do produto")],
                responses: {
                    200: resposta("Produto excluído com sucesso.", {
                        type: "object", properties: { message: { type: "string" }, produto: ref("Produto") }
                    }),
                    401: R401,
                    404: erro("Produto não encontrado."),
                    500: R500
                }
            }
        },
 
        // ==================== ANÚNCIOS ====================
        "/anuncios": {
            get: {
                tags: ["Anúncios"],
                summary: "Lista os anúncios ativos (com filtro opcional por categoria)",
                parameters: [
                    { name: "categoria", in: "query", required: false, schema: { type: "string" }, description: "Filtra por categoria", example: "Máquinas" }
                ],
                responses: {
                    200: resposta("Lista de anúncios ativos.", { type: "array", items: ref("Anuncio") }),
                    401: R401,
                    500: R500
                }
            },
            post: {
                tags: ["Anúncios"],
                summary: "Cadastra um anúncio (vendedor vem do token)",
                requestBody: corpo(ref("AnuncioInput")),
                responses: {
                    201: resposta("Anúncio cadastrado com sucesso na plataforma.", {
                        type: "object", properties: { message: { type: "string" }, anuncio: ref("Anuncio") }
                    }),
                    400: erro("Título, categoria ou preço ausentes."),
                    401: R401,
                    500: R500
                }
            }
        },
        "/anuncios/{id}": {
            get: {
                tags: ["Anúncios"],
                summary: "Busca um anúncio pelo ID",
                parameters: [idPath("id", "ID do anúncio")],
                responses: {
                    200: resposta("Anúncio encontrado.", ref("Anuncio")),
                    401: R401,
                    404: erro("Anúncio não encontrado."),
                    500: R500
                }
            },
            put: {
                tags: ["Anúncios"],
                summary: "Atualiza um anúncio (somente o dono)",
                description: "Atualização completa: todos os campos são regravados, então envie todos.",
                parameters: [idPath("id", "ID do anúncio")],
                requestBody: corpo(ref("AnuncioInput")),
                responses: {
                    200: resposta("Anúncio atualizado com sucesso.", {
                        type: "object", properties: { message: { type: "string" }, anuncio: ref("Anuncio") }
                    }),
                    401: R401,
                    404: erro("Anúncio inexistente ou pertence a outro usuário."),
                    500: R500
                }
            },
            delete: {
                tags: ["Anúncios"],
                summary: "Exclui um anúncio (somente o dono)",
                parameters: [idPath("id", "ID do anúncio")],
                responses: {
                    200: resposta("O anúncio foi permanentemente removido da plataforma.", {
                        type: "object", properties: { message: { type: "string" } }
                    }),
                    401: R401,
                    404: erro("Anúncio inexistente ou pertence a outro usuário."),
                    500: R500
                }
            }
        },
 
        // ==================== CATEGORIAS ====================
        "/categorias": {
            get: {
                tags: ["Categorias"],
                summary: "Lista todas as categorias",
                responses: {
                    200: resposta("Lista de categorias.", { type: "array", items: ref("Categoria") }),
                    401: R401,
                    500: R500
                }
            },
            post: {
                tags: ["Categorias"],
                summary: "Cria uma nova categoria",
                requestBody: corpo({
                    type: "object",
                    required: ["nome_categoria"],
                    properties: { nome_categoria: { type: "string", example: "Rações e Nutrição" } }
                }),
                responses: {
                    201: resposta("Categoria registrada com sucesso.", {
                        type: "object", properties: { message: { type: "string" }, dados: ref("Categoria") }
                    }),
                    400: erro("Nome ausente ou categoria já existente."),
                    401: R401,
                    500: R500
                }
            }
        },
        "/categorias/{id}": {
            put: {
                tags: ["Categorias"],
                summary: "Atualização total do nome da categoria",
                parameters: [idPath("id", "ID da categoria")],
                requestBody: corpo({
                    type: "object",
                    required: ["nome_categoria"],
                    properties: { nome_categoria: { type: "string", example: "Implementos Agrícolas" } }
                }),
                responses: {
                    200: resposta("Categoria atualizada com sucesso.", {
                        type: "object", properties: { message: { type: "string" }, dados: ref("Categoria") }
                    }),
                    400: erro("Nome da categoria ausente."),
                    401: R401,
                    404: erro("Categoria não encontrada."),
                    500: R500
                }
            },
            patch: {
                tags: ["Categorias"],
                summary: "Atualização parcial da categoria",
                parameters: [idPath("id", "ID da categoria")],
                requestBody: corpo({
                    type: "object",
                    properties: { nome_categoria: { type: "string", example: "Implementos Agrícolas" } }
                }),
                responses: {
                    200: resposta("Categoria modificada parcialmente com sucesso.", {
                        type: "object", properties: { message: { type: "string" }, dados: ref("Categoria") }
                    }),
                    400: erro("Nome da categoria enviado vazio."),
                    401: R401,
                    404: erro("Categoria não encontrada."),
                    500: R500
                }
            },
            delete: {
                tags: ["Categorias"],
                summary: "Exclui uma categoria",
                parameters: [idPath("id", "ID da categoria")],
                responses: {
                    200: resposta("Categoria removida com sucesso.", {
                        type: "object", properties: { message: { type: "string" } }
                    }),
                    401: R401,
                    404: erro("Categoria não encontrada."),
                    500: R500
                }
            }
        },
 
        // ==================== AGENDAMENTOS ====================
        "/agendamentos": {
            get: {
                tags: ["Agendamentos"],
                summary: "Lista todos os agendamentos com nomes legíveis",
                responses: {
                    200: resposta("Lista de agendamentos.", { type: "array", items: ref("AgendamentoLista") }),
                    401: R401,
                    500: R500
                }
            },
            post: {
                tags: ["Agendamentos"],
                summary: "Cria um agendamento para um produto",
                requestBody: corpo({
                    type: "object",
                    required: ["id_comprador", "id_produto"],
                    properties: {
                        id_comprador: { type: "integer", example: 48 },
                        id_produto: { type: "integer", example: 4 },
                        observacoes: { type: "string", example: "Quero combinar a entrega da ração." }
                    }
                }),
                responses: {
                    201: resposta("Agendamento realizado com sucesso!", {
                        type: "object", properties: { message: { type: "string" }, agendamento: ref("Agendamento") }
                    }),
                    400: erro("id_comprador ou id_produto ausentes."),
                    401: R401,
                    500: R500
                }
            }
        },
 
        // ==================== VENDAS ====================
        "/vendas": {
            post: {
                tags: ["Vendas"],
                summary: "Registra uma venda (comprador vem do token) e notifica o vendedor",
                requestBody: corpo(ref("VendaInput")),
                responses: {
                    201: resposta("Transação de venda registrada com sucesso!", {
                        type: "object", properties: { message: { type: "string" }, venda: ref("Venda") }
                    }),
                    400: erro("id_anuncio, id_vendedor ou valor_total ausentes."),
                    401: R401,
                    500: R500
                }
            }
        },
        "/vendas/compras": {
            get: {
                tags: ["Vendas"],
                summary: "Histórico de compras do usuário logado",
                responses: {
                    200: resposta("Lista de compras.", { type: "array", items: ref("Venda") }),
                    401: R401,
                    500: R500
                }
            }
        },
        "/vendas/pedidos": {
            get: {
                tags: ["Vendas"],
                summary: "Pedidos recebidos pelo vendedor logado",
                responses: {
                    200: resposta("Lista de pedidos recebidos.", { type: "array", items: ref("Venda") }),
                    401: R401,
                    500: R500
                }
            }
        },
        "/vendas/{id}": {
            put: {
                tags: ["Vendas"],
                summary: "Atualiza status de pagamento/entrega (somente o vendedor da venda)",
                parameters: [idPath("id", "ID da venda")],
                requestBody: corpo({
                    type: "object",
                    properties: {
                        status_pagamento: { type: "string", example: "Pago" },
                        status_entrega: { type: "string", example: "Enviado" }
                    }
                }),
                responses: {
                    200: resposta("Status do pedido atualizado com sucesso.", {
                        type: "object", properties: { message: { type: "string" }, venda: ref("Venda") }
                    }),
                    401: R401,
                    404: erro("Venda inexistente ou sem autorização para alterá-la."),
                    500: R500
                }
            }
        },
 
        // ==================== CHATS ====================
        "/chats": {
            post: {
                tags: ["Chats"],
                summary: "Cria um chat ou retorna o já existente (comprador vem do token)",
                requestBody: corpo({
                    type: "object",
                    required: ["id_produto", "id_vendedor"],
                    properties: {
                        id_produto: { type: "integer", example: 4 },
                        id_vendedor: { type: "integer", example: 2 }
                    }
                }),
                responses: {
                    200: resposta("Chat já existente localizado.", {
                        type: "object", properties: { message: { type: "string" }, chat: { type: "object", properties: { id: { type: "integer", example: 3 } } } }
                    }),
                    201: resposta("Sala de chat iniciada com sucesso.", {
                        type: "object", properties: { message: { type: "string" }, chat: ref("Chat") }
                    }),
                    400: erro("id_produto ou id_vendedor ausentes."),
                    401: R401,
                    500: R500
                }
            },
            get: {
                tags: ["Chats"],
                summary: "Lista os chats do usuário logado (como comprador ou vendedor)",
                responses: {
                    200: resposta("Lista de chats.", { type: "array", items: ref("ChatLista") }),
                    401: R401,
                    500: R500
                }
            }
        },
        "/chats/{id_chat}/mensagens": {
            post: {
                tags: ["Chats"],
                summary: "Envia uma mensagem no chat (gera notificação ao outro participante)",
                parameters: [idPath("id_chat", "ID do chat")],
                requestBody: corpo({
                    type: "object",
                    required: ["conteudo"],
                    properties: { conteudo: { type: "string", example: "Olá, ainda está disponível?" } }
                }),
                responses: {
                    201: resposta("Mensagem enviada com sucesso.", {
                        type: "object", properties: { message: { type: "string" }, mensagem: ref("Mensagem") }
                    }),
                    400: erro("Mensagem vazia."),
                    401: R401,
                    500: R500
                }
            },
            get: {
                tags: ["Chats"],
                summary: "Retorna todas as mensagens de um chat",
                parameters: [idPath("id_chat", "ID do chat")],
                responses: {
                    200: resposta("Histórico de mensagens.", { type: "array", items: ref("MensagemLista") }),
                    401: R401,
                    500: R500
                }
            }
        }
    }
};
 
export default documentacao;