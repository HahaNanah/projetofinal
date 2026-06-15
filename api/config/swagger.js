const documentacao = {
    openapi: "3.0.3",
    info: {
        title: "API Site de Agricultura",
        description: "API para gerenciamento de produtos agrícolas, categorias, usuários e perfis.",
        version: "1.0.0"
    },
 servers: [
    {
        url: "https://projetofinal-teal.vercel.app/api", // 👈 Adicione o /api aqui no final
        description: "Servidor de Produção Vercel"
    }
    ],
    components: {
        securitySchemes: {
            bearerAuth: {
                type: "http",
                scheme: "bearer",
                bearerFormat: "JWT",
                description: "Token JWT para autenticação. Cole APENAS o token gerado no login (o Swagger adiciona o 'Bearer ' automaticamente)."
            }
        }
    }, // <-- Note que esta vírgula separa o 'components' do 'security'
    security: [
        {
            bearerAuth: []
        }
    ],
    tags: [
        { name: "Login", description: "Gerenciamento de usuários e acessos" },
        { name: "Perfil", description: "Gerenciamento de informações do perfil do usuário" },
        { name: "Produtos", description: "Gerenciamento do catálogo de produtos" },
        { name: "Categorias", description: "Gerenciamento das categorias de produtos" },
        { name: "Agendamentos", description: "Gerenciamento de visitas e negociações de produtos" }
    ],
    paths: {
        "/login": {
            get: {
                tags: ["Login"],
                summary: "Lista todos os usuários cadastrados",
                responses: {
                    200: { 
                        description: "Lista de usuários retornada com sucesso.",
                        content: {
                            "application/json": {
                                schema: {
                                    type: "array",
                                    items: {
                                        type: "object",
                                        properties: {
                                            id: { type: "integer", example: 1 },
                                            email: { type: "string", example: "vendedor@email.com" },
                                            tipo_usuario: { type: "string", example: "vendedor" }
                                        }
                                    }
                                }
                            }
                        }
                    },
                    500: { description: "Erro interno no servidor." }
                }
            },
            post: {
                tags: ["Login"],
                summary: "Cadastra um novo usuário",
                security: [], // Remove a exigência de Token para cadastro!
                requestBody: {
                    required: true,
                    content: {
                        "application/json": {
                            schema: {
                                type: "object",
                                required: ["email", "senha", "tipo_usuario"],
                                properties: {
                                    email: { type: "string", example: "comprador@email.com" },
                                    senha: { type: "string", example: "123" },
                                    tipo_usuario: { type: "string", enum: ["vendedor", "comprador"], example: "comprador" }
                                }
                            }
                        }
                    }
                },
                responses: {
                    201: { 
                        description: "Cadastro feito com sucesso!",
                        content: {
                            "application/json": {
                                schema: {
                                    type: "object",
                                    properties: {
                                        message: { type: "string", example: "Usuário cadastrado com sucesso!" },
                                        usuario: {
                                            type: "object",
                                            properties: {
                                                id: { type: "integer", example: 2 },
                                                email: { type: "string", example: "comprador@email.com" },
                                                tipo_usuario: { type: "string", example: "comprador" }
                                            }
                                        }
                                    }
                                }
                            }
                        }
                    }
                }
            }
        },
        "/login/auth": {
            post: {
                tags: ["Login"],
                summary: "Autentica usuário e retorna JWT Token",
                description: "Faz login com email, senha e tipo de usuário, retornando um token JWT para usar nas rotas protegidas",
                security: [], // Remove a exigência de Token para fazer login!
                requestBody: {
                    required: true,
                    content: {
                        "application/json": {
                            schema: {
                                type: "object",
                                required: ["email", "senha", "tipo_usuario"],
                                properties: {
                                    email: { type: "string", example: "vendedor@email.com" },
                                    senha: { type: "string", example: "123" },
                                    tipo_usuario: { type: "string", enum: ["vendedor", "comprador"], example: "vendedor" }
                                }
                            }
                        }
                    }
                },
                responses: {
                    200: { 
                        description: "Autenticação bem-sucedida! Retorna usuário e token JWT.",
                        content: {
                            "application/json": {
                                schema: {
                                    type: "object",
                                    properties: {
                                        message: { type: "string", example: "Login efetuado com sucesso!" },
                                        usuario: {
                                            type: "object",
                                            properties: {
                                                id: { type: "integer", example: 1 },
                                                email: { type: "string", example: "vendedor@email.com" },
                                                tipo_usuario: { type: "string", example: "vendedor" }
                                            }
                                        },
                                        token: { type: "string", example: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..." }
                                    }
                                }
                            }
                        }
                    },
                    401: { description: "E-mail, senha ou tipo de usuário incorretos." },
                    400: { description: "Campos obrigatórios não foram preenchidos." }
                }
            }
        },
        "/login/{id}": {
            put: {
                tags: ["Login"],
                summary: "Atualiza completamente um usuário por ID",
                parameters: [
                    { name: "id", in: "path", required: true, schema: { type: "integer" }, description: "ID do usuário" }
                ],
                requestBody: {
                    required: true,
                    content: {
                        "application/json": {
                            schema: {
                                type: "object",
                                required: ["email", "senha", "tipo_usuario"],
                                properties: {
                                    email: { type: "string", example: "vendedor_novo@email.com" },
                                    senha: { type: "string", example: "nova_senha123" },
                                    tipo_usuario: { type: "string", enum: ["vendedor", "comprador"], example: "vendedor" }
                                }
                            }
                        }
                    }
                },
                responses: {
                    200: {
                        description: "Login atualizado com sucesso!",
                        content: {
                            "application/json": {
                                schema: {
                                    type: "object",
                                    properties: {
                                        message: { type: "string", example: "Login atualizado com sucesso!" },
                                        usuario: { type: "object" }
                                    }
                                }
                            }
                        }
                    },
                    404: { description: "Login não encontrado" }
                }
            },
            delete: {
                tags: ["Login"],
                summary: "Deleta um usuário por ID",
                parameters: [
                    { name: "id", in: "path", required: true, schema: { type: "integer" }, description: "ID do usuário" }
                ],
                responses: {
                    200: {
                        description: "Login removido com sucesso!",
                        content: {
                            "application/json": {
                                schema: {
                                    type: "object",
                                    properties: {
                                        message: { type: "string", example: "Login removido com sucesso!" },
                                        usuario: { type: "object" }
                                    }
                                }
                            }
                        }
                    },
                    404: { description: "Login não encontrado" }
                }
            }
        },
        "/perfil": {
            post: {
                tags: ["Perfil"],
                summary: "Cadastra/Completa as informações do perfil do usuário",
                requestBody: {
                    required: true,
                    content: {
                        "application/json": {
                            schema: {
                                type: "object",
                                required: ["usuario_id", "nome_completo", "tipo_usuario"],
                                properties: {
                                    usuario_id: { type: "integer", example: 2 },
                                    nome_completo: { type: "string", example: "João da Silva" },
                                    telefone: { type: "string", example: "(18) 99999-1111" },
                                    nome_fazenda_ou_empresa: { type: "string", example: "Fazenda Boa Vista" },
                                    cpf_cnpj: { type: "string", example: "12.345.678/0001-99" },
                                    tipo_usuario: { type: "string", enum: ["vendedor", "comprador"], example: "vendedor" }
                                }
                            }
                        }
                    }
                },
                responses: {
                    201: {
                        description: "Perfil criado com sucesso!",
                        content: {
                            "application/json": {
                                schema: {
                                    type: "object",
                                    properties: {
                                        message: { type: "string", example: "Perfil criado com sucesso!" },
                                        perfil: { type: "object" }
                                    }
                                }
                            }
                        }
                    },
                    401: { description: "Token inválido ou ausente." },
                    400: { description: "Perfil já existente ou dados inválidos." },
                    500: { description: "Erro interno ao salvar perfil." }
                }
            }
        },
        "/perfil/{usuario_id}": {
            get: {
                tags: ["Perfil"],
                summary: "Busca os detalhes do perfil integrado ao e-mail",
                parameters: [
                    { name: "usuario_id", in: "path", required: true, schema: { type: "integer" }, description: "ID do usuário (Vem da tabela Login)" }
                ],
                responses: {
                    200: {
                        description: "Perfil retornado com sucesso trazendo dados integrados.",
                        content: {
                            "application/json": {
                                schema: {
                                    type: "object",
                                    properties: {
                                        usuario_id: { type: "integer", example: 2 },
                                        email: { type: "string", example: "vendedor@email.com" },
                                        nome_completo: { type: "string", example: "João da Silva" },
                                        telefone: { type: "string", example: "(18) 99999-1111" },
                                        nome_fazenda_ou_empresa: { type: "string", example: "Fazenda Boa Vista" },
                                        cpf_cnpj: { type: "string", example: "12.345.678/0001-99" },
                                        tipo_usuario: { type: "string", example: "vendedor" }
                                    }
                                }
                            }
                        }
                    },
                    401: { description: "Token inválido ou ausente." },
                    404: { description: "Perfil não encontrado." },
                    500: { description: "Erro interno ao buscar perfil." }
                }
            },
            put: {
                tags: ["Perfil"],
                summary: "Atualiza os dados de um perfil existente",
                parameters: [
                    { name: "usuario_id", in: "path", required: true, schema: { type: "integer" }, description: "ID do usuário" }
                ],
                requestBody: {
                    required: true,
                    content: {
                        "application/json": {
                            schema: {
                                type: "object",
                                required: ["nome_completo", "tipo_usuario"],
                                properties: {
                                    nome_completo: { type: "string", example: "João da Silva Atualizado" },
                                    telefone: { type: "string", example: "(18) 99999-2222" },
                                    nome_fazenda_ou_empresa: { type: "string", example: "Nova Fazenda Vista Linda" },
                                    cpf_cnpj: { type: "string", example: "12.345.678/0001-99" },
                                    tipo_usuario: { type: "string", enum: ["vendedor", "comprador"], example: "vendedor" }
                                }
                            }
                        }
                    }
                },
                responses: {
                    200: {
                        description: "Perfil updated com sucesso!",
                        content: {
                            "application/json": {
                                schema: {
                                    type: "object",
                                    properties: {
                                        message: { type: "string", example: "Perfil atualizado com sucesso!" },
                                        perfil: { type: "object" }
                                    }
                                }
                            }
                        }
                    },
                    401: { description: "Token inválido ou ausente." },
                    404: { description: "Perfil não encontrado para alteração." },
                    500: { description: "Erro interno ao atualizar." }
                }
            },
            delete: {
                tags: ["Perfil"],
                summary: "Deleta um perfil por ID",
                parameters: [
                    { name: "usuario_id", in: "path", required: true, schema: { type: "integer" }, description: "ID do usuário" }
                ],
                responses: {
                    200: { description: "Perfil removido com sucesso!" },
                    404: { description: "Perfil não encontrado." }
                }
            }
        },
        "/produtos": {
            get: {
                tags: ["Produtos"],
                summary: "Lista todos os produtos agrícolas",
                responses: {
                    200: { 
                        description: "Lista de produtos carregada.",
                        content: {
                            "application/json": {
                                schema: {
                                    type: "array",
                                    items: {
                                        type: "object",
                                        properties: {
                                            id: { type: "integer", example: 1 },
                                            vendedor_id: { type: "integer", example: 2 },
                                            categoria: { type: "string", example: "Gados" },
                                            nome_produto: { type: "string", example: "Garrote Nelore PO" },
                                            preco: { type: "number", example: 3200.00 },
                                            quantidade_disponivel: { type: "integer", example: 15 },
                                            cidade: { type: "string", example: "Rondonópolis" }
                                        }
                                    }
                                }
                            }
                        }
                    }
                }
            },
            post: {
                tags: ["Produtos"],
                summary: "Cadastra um novo produto agrícola",
                requestBody: {
                    required: true,
                    content: {
                        "application/json": {
                            schema: {
                                type: "object",
                                required: ["vendedor_id", "categoria", "nome_produto", "quantidade_disponivel", "preco", "estado", "cidade", "cep", "prazo_entrega", "tipo_anuncio"],
                                properties: {
                                    vendedor_id: { type: "integer", example: 2 },
                                    categoria: { type: "string", example: "Rações" },
                                    nome_produto: { type: "string", example: "Ração para Bovinos de Leite 22%" },
                                    marca: { type: "string", example: "Nutribon" },
                                    unidade: { type: "string", example: "Saco 40kg" },
                                    quantidade_disponivel: { type: "integer", example: 80 },
                                    preco: { type: "number", example: 125.00 },
                                    descricao: { type: "string", example: "Ração de alta qualidade com 22% de proteína bruta, excelente para vacas em lactação." },
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
                            }
                        }
                    }
                },
                responses: {
                    201: { 
                        description: "Produto cadastrado com sucesso!",
                        content: {
                            "application/json": {
                                schema: {
                                    type: "object",
                                    properties: {
                                        message: { type: "string", example: "Produto cadastrado com sucesso!" },
                                        produto: { type: "object" }
                                    }
                                }
                            }
                        }
                    }
                }
            }
        },
        "/produtos/{id}": {
            get: {
                tags: ["Produtos"],
                summary: "Busca um produto específico pelo ID",
                parameters: [
                    { name: "id", in: "path", required: true, schema: { type: "integer" }, description: "ID do produto" }
                ],
                responses: {
                    200: {
                        description: "Produto encontrado.",
                        content: { "application/json": { schema: { type: "object" } } }
                    },
                    404: { description: "Produto não encontrado" }
                }
            },
            put: {
                tags: ["Produtos"],
                summary: "Atualiza completamente um produto por ID",
                parameters: [
                    { name: "id", in: "path", required: true, schema: { type: "integer" }, description: "ID do produto" }
                ],
                requestBody: {
                    required: true,
                    content: {
                        "application/json": {
                            schema: {
                                type: "object",
                                properties: {
                                    categoria: { type: "string", example: "Máquinas" },
                                    nome_produto: { type: "string", example: "Trator Massey Ferguson 2024" },
                                    marca: { type: "string", example: "Massey Ferguson" },
                                    unidade: { type: "string", example: "Unidade" },
                                    quantidade_disponivel: { type: "integer", example: 2 },
                                    preco: { type: "number", example: 245000.00 },
                                    descricao: { type: "string", example: "Descrição atualizada do produto." },
                                    foto_produto: { type: "string", example: "https://link-da-foto.com/imagem.jpg" },
                                    estado: { type: "string", example: "São Paulo" },
                                    cidade: { type: "string", example: "Andradina" },
                                    localizacao_detalhada: { type: "string", example: "Fazenda Nova" },
                                    cep: { type: "string", example: "16900-000" },
                                    frete: { type: "string", example: "Transportadora própria" },
                                    prazo_entrega: { type: "string", example: "3 dias úteis" },
                                    tipo_anuncio: { type: "string", enum: ["Novo", "Seminovo"], example: "Novo" },
                                    destaque: { type: "boolean", example: false }
                                }
                            }
                        }
                    }
                },
                responses: {
                    200: { description: "Produto updated com sucesso!" },
                    404: { description: "Produto não encontrado" }
                }
            },
            delete: {
                tags: ["Produtos"],
                summary: "Remove permanentemente um produto por ID",
                parameters: [
                    { name: "id", in: "path", required: true, schema: { type: "integer" }, description: "ID do produto" }
                ],
                responses: {
                    200: { description: "Produto deletado com sucesso!" },
                    404: { description: "Produto não encontrado" }
                }
            }
        },
        "/categorias": {
            get: {
                tags: ["Categorias"],
                summary: "Lista todos as categorias de produtos",
                responses: {
                    200: { 
                        description: "Lista de categorias retornada com sucesso.",
                        content: {
                            "application/json": {
                                schema: {
                                    type: "array",
                                    items: {
                                        type: "object",
                                        properties: {
                                            id: { type: "integer", example: 1 },
                                            nome_categoria: { type: "string", example: "Maquinários" }
                                        }
                                    }
                                }
                            }
                        }
                    }
                }
            },
            post: {
                tags: ["Categorias"],
                summary: "Adiciona uma nova categoria",
                requestBody: {
                    required: true,
                    content: {
                        "application/json": {
                            schema: {
                                type: "object",
                                required: ["nome_categoria"],
                                properties: {
                                    nome_categoria: { type: "string", example: "Rações e Nutrição" }
                                }
                            }
                        }
                    }
                },
                responses: {
                    201: { 
                        description: "Categoria criada com sucesso!",
                        content: {
                            "application/json": {
                                schema: {
                                    type: "object",
                                    properties: {
                                        mensagem: { type: "string", example: "Categoria criada com sucesso!" },
                                        dados: { type: "object" }
                                    }
                                }
                            }
                        }
                    }
                }
            }
        },
        "/categorias/{id}": {
            put: {
                tags: ["Categorias"],
                summary: "Altera o nome de uma categoria existente por ID",
                parameters: [
                    { name: "id", in: "path", required: true, schema: { type: "integer" }, description: "ID do categoria" }
                ],
                requestBody: {
                    required: true,
                    content: {
                        "application/json": {
                            schema: {
                                type: "object",
                                required: ["nome_categoria"],
                                properties: {
                                    nome_categoria: { type: "string", example: "Implementos Agrícolas" }
                                }
                            }
                        }
                    }
                },
                responses: {
                    200: { description: "Categoria atualizada com sucesso!" },
                    404: { description: "Categoria não encontrada." }
                }
            },
            delete: {
                tags: ["Categorias"],
                summary: "Deleta fisicamente uma categoria do banco por ID",
                parameters: [
                    { name: "id", in: "path", required: true, schema: { type: "integer" }, description: "ID da categoria" }
                ],
                responses: {
                    200: { description: "Categoria deletada com sucesso!" },
                    404: { description: "Categoria não encontrada." }
                }
            }
        },
        "/agendamentos": {
            get: {
                tags: ["Agendamentos"],
                summary: "Lista todos os agendamentos realizados",
                responses: {
                    200: {
                        description: "Lista de agendamentos retornada com sucesso.",
                        content: {
                            "application/json": {
                                schema: {
                                    type: "array",
                                    items: {
                                        type: "object",
                                        properties: {
                                            agendamento_id: { type: "integer", example: 1 },
                                            nome_comprador: { type: "string", example: "Carlos Souza" },
                                            nome_produto: { type: "string", example: "Ração para Bovinos de Leite 22%" },
                                            preco: { type: "number", example: 125.00 },
                                            data_agendamento: { type: "string", format: "date-time", example: "2026-06-09T09:52:02.469Z" },
                                            status_agendamento: { type: "string", example: "Pendente" },
                                            observacoes: { type: "string", example: "Quero combinar a entrega da ração." }
                                        }
                                    }
                                }
                            }
                        }
                    },
                    500: { description: "Erro interno ao listar agendamentos." }
                }
            },
            post: {
                tags: ["Agendamentos"],
                summary: "Cria um novo agendamento para um produto",
                requestBody: {
                    required: true,
                    content: {
                        "application/json": {
                            schema: {
                                type: "object",
                                required: ["id_comprador", "id_produto"],
                                properties: {
                                    id_comprador: { type: "integer", example: 48 },
                                    id_produto: { type: "integer", example: 4 },
                                    observacoes: { type: "string", example: "Quero combinar a entrega da ração." }
                                }
                            }
                        }
                    }
                },
                responses: {
                    201: {
                        description: "Agendamento criado com sucesso!",
                        content: {
                            "application/json": {
                                schema: {
                                    type: "object",
                                    properties: {
                                        message: { type: "string", example: "Agendamento realizado com sucesso!" },
                                        id_agendamento: { type: "integer", example: 12 }
                                    }
                                }
                            }
                        }
                    },
                    400: { description: "Dados inválidos fornecidos." },
                    500: { description: "Erro interno ao criar agendamento." }
                }
            }
        }
        ,
        "/agendamentos/{id}": {
            delete: {
                tags: ["Agendamentos"],
                summary: "Remove um agendamento por ID",
                description: "Deleta um agendamento. Apenas o comprador que criou ou o vendedor dono do produto podem deletar.",
                parameters: [
                    { name: "id", in: "path", required: true, schema: { type: "integer" }, description: "ID do agendamento" }
                ],
                responses: {
                    200: { description: "Agendamento removido com sucesso!" },
                    403: { description: "Acesso negado. Usuário não autorizado a remover este agendamento." },
                    404: { description: "Agendamento não encontrado." },
                    500: { description: "Erro interno ao tentar remover o agendamento." }
                }
            }
        }
    }
};

export default documentacao;