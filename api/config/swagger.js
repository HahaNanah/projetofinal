const documentacao = {
    openapi: "3.0.3",
    info: {
        title: "API ConectaAgro",
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
       { name: "Usuários", description: "Gerenciamento de usuários e acessos" },
        { name: "Perfil", description: "Gerenciamento de informações do perfil do usuário" },
        { name: "Produtos", description: "Gerenciamento do catálogo de produtos" },
        { name: "Categorias", description: "Gerenciamento das categorias de produtos" },
        { name: "Agendamentos", description: "Gerenciamento de visitas e negociações de produtos" },
        { name: "Anúncios", description: "Gerenciamento de publicações de ofertas e produtos na plataforma" },
        { name: "Chats", description: "Sistema de troca de mensagens e notificações entre usuários" },
        { name: "Vendas", description: "Histórico de compras, pedidos recebidos e fluxo transacional" }
    ],
    paths: {
        "/login": {
            get: {
                tags: ["Usuários"],
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
                tags: ["Usuários"],
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
                tags: ["Usuários"],
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
                tags: ["Usuários"],
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
                tags: ["Usuários"],
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
                401: { 
  description: "Senha incorreta. Verifique sua senha e tente novamente." 
},

403: { 
  description: "Acesso bloqueado. Sua conta pode estar desativada ou sem permissão para acessar o sistema." 
},
500: { 
  description: "Erro interno no servidor ao tentar realizar o login. Tente novamente mais tarde." 
}
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
                    401: { 
  description: "Você não está autenticado ou sua sessão expirou. Isso significa que o sistema não conseguiu confirmar sua identidade. Para resolver, faça login novamente e tente enviar a requisição outra vez." 
},

400: { 
  description: "Os dados enviados estão inválidos, incompletos ou em um formato que o sistema não entende. Isso pode acontecer quando algum campo obrigatório não foi preenchido ou foi preenchido de forma incorreta. Verifique as informações e tente novamente." 
},

500: { 
  description: "Ocorreu um erro interno no servidor ao tentar processar sua solicitação. Isso significa que o problema não foi causado por você, mas sim pelo sistema. Tente novamente em alguns minutos. Se continuar acontecendo, pode ser necessário suporte técnico." 
}
                }
            }
        },
        "/perfil/{usuario_id}": {
            get: {
                tags: ["Perfil"],
                summary: "Busca os detalhes do perfil junto com o email do usuário.",
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
                401: { 
  description: "Você não está autenticado ou o token enviado é inválido. Faça login novamente para obter um novo token e tentar outra vez." 
},

404: { 
  description: "Não foi possível encontrar o perfil solicitado. Verifique se o usuário ou ID informado está correto." 
},

500: { 
  description: "Ocorreu um erro interno no servidor ao tentar buscar o perfil. Isso não é um problema do seu lado. Tente novamente em alguns minutos." 
}
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
                401: { 
  description: "Você não está autenticado ou o token enviado é inválido ou expirou. Isso significa que o sistema não conseguiu confirmar sua identidade. Para continuar, faça login novamente e tente atualizar o perfil mais uma vez." 
},

404: { 
  description: "Não foi possível encontrar o perfil que você está tentando atualizar. Isso pode acontecer se o ID do usuário estiver incorreto ou se o perfil não existir no sistema. Verifique as informações e tente novamente." 
},

500: { 
  description: "Ocorreu um erro interno no servidor ao tentar atualizar o perfil. Isso significa que o problema não foi causado por você, mas sim pelo sistema. Tente novamente em alguns minutos. Se o erro continuar, pode ser necessário suporte técnico." 
}
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
                         description: "Produto encontrado com sucesso. Os dados do produto foram retornados corretamente." ,
                        content: { "application/json": { schema: { type: "object" } } }
                    },
                  404: { 
  description: "Não foi possível encontrar o produto solicitado. Isso pode acontecer se o ID estiver incorreto, se o produto tiver sido removido ou se não existir no sistema. Verifique as informações e tente novamente." 
}
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
                 200: { 
  description: "Produto atualizado com sucesso. As alterações foram salvas e já estão disponíveis no sistema." 
},

404: { 
  description: "Não foi possível encontrar o produto para atualização. Verifique se o ID informado está correto ou se o produto ainda existe." 
}
                }
            },
            delete: {
                tags: ["Produtos"],
                summary: "Remove permanentemente um produto por ID",
                parameters: [
                    { name: "id", in: "path", required: true, schema: { type: "integer" }, description: "ID do produto" }
                ],
                responses: {
                  200: { 
  description: "Produto deletado com sucesso. O item foi removido do sistema e não está mais disponível." 
},

404: { 
  description: "Não foi possível encontrar o produto para exclusão. Verifique se o ID informado está correto ou se o produto já foi removido." 
}
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
                    200: { 
  description: "Categoria atualizada com sucesso. As alterações foram salvas e já estão disponíveis no sistema." 
},

404: { 
  description: "Não foi possível encontrar a categoria para atualização. Verifique se o ID informado está correto ou se a categoria ainda existe." 
}
                }
            },
            delete: {
                tags: ["Categorias"],
                summary: "Deleta fisicamente uma categoria do banco por ID",
                parameters: [
                    { name: "id", in: "path", required: true, schema: { type: "integer" }, description: "ID da categoria" }
                ],
                responses: {
                    200: { 
  description: "Categoria deletada com sucesso. O item foi removido do sistema e não está mais disponível." 
},
                    404: { 
  description: "Não foi possível encontrar a categoria para exclusão. Verifique se o ID informado está correto ou se a categoria já foi removida." 
}
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
500: { 
  description: "Ocorreu um erro interno no servidor ao tentar listar os agendamentos. Isso não é causado por você. Tente novamente em alguns minutos. Se o problema continuar, pode ser necessário suporte técnico." 
}                }
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
                 400: { 
  description: "Os dados fornecidos estão inválidos ou incompletos. Verifique se todas as informações obrigatórias foram preenchidas corretamente antes de tentar novamente." 
},

500: { 
  description: "Ocorreu um erro interno no servidor ao tentar criar o agendamento. Isso não é causado pelos dados enviados. Tente novamente em alguns minutos." 
}
                }
            }
        }
    },
    paths: {
        // ==========================================
        // ROTAS DE ANÚNCIOS
        // ==========================================
        "/anuncios": {
    post: {
        summary: "Cadastrar um novo anúncio",
        tags: ["Anúncios"],
        security: [{ bearerAuth: [] }],
        requestBody: {
            required: true,
            content: {
                "application/json": {
                    schema: {
                        type: "object",
                        properties: {
                            categoria: { type: "string" },
                            titulo: { type: "string" },
                            preco: { type: "number" },
                            quantidade_disponivel: { type: "integer", default: 1 },
                            descricao: { type: "string" },
                            foto_produto: { type: "string" },
                            status: { type: "string", enum: ["Ativo", "Pausado", "Vendido", "Excluído"], default: "Ativo" }
                        },
                        required: ["categoria", "titulo", "preco"]
                    }
                }
            }
        },
        responses: {
            201: { 
                description: "Anúncio cadastrado com sucesso na plataforma.",
                content: {
                    "application/json": {
                        schema: {
                            type: "object",
                            properties: {
                                message: { type: "string" },
                                anuncio: { type: "object" }
                            }
                        }
                    }
                }
            },
            400: { 
                description: "Parâmetros essenciais ausentes no body -> categoria, titulo ou preco.",
                content: {
                    "application/json": {
                        schema: {
                            type: "object",
                            properties: {
                                error: { type: "string" },
                                message: { type: "string" }
                            }
                        }
                    }
                }
            },
            500: { 
                description: "Falha ao executar INSERT na tabela 'Anuncios'.",
                content: {
                    "application/json": {
                        schema: {
                            type: "object",
                            properties: {
                                error: { type: "string" },
                                message: { type: "string" }
                            }
                        }
                    }
                }
            }
        }
    },
    get: {
        summary: "Listar todos os anúncios ativos",
        tags: ["Anúncios"],
        security: [{ bearerAuth: [] }],
        parameters: [
            {
                name: "categoria",
                in: "query",
                required: false,
                description: "Filtrar anúncios por uma categoria específica",
                schema: { type: "string" }
            }
        ],
        responses: {
            200: { 
                description: "Retorna a lista de anúncios ativos com dados do perfil do vendedor.",
                content: {
                    "application/json": {
                        schema: {
                            type: "array",
                            items: { type: "object" }
                        }
                    }
                }
            },
            500: { 
                description: "Falha na instrução SELECT na tabela 'Anuncios'." 
            }
        }
    }
},
"/anuncios/{id}": {
    get: {
        summary: "Buscar um anúncio específico pelo ID",
        tags: ["Anúncios"],
        security: [{ bearerAuth: [] }],
        parameters: [
            { name: "id", in: "path", required: true, schema: { type: "integer" } }
        ],
        responses: {
            200: { 
                description: "Detalhes do anúncio e dados de contato do vendedor retornados.",
                content: {
                    "application/json": {
                        schema: { type: "object" }
                    }
                }
            },
            404: { 
                description: "O ID enviado no parâmetro da URL não foi localizado na tabela 'Anuncios'." 
            },
            500: { 
                description: "Erro interno ao buscar o anúncio." 
            }
        }
    },
    put: {
        summary: "Atualizar um anúncio (Apenas o dono)",
        tags: ["Anúncios"],
        security: [{ bearerAuth: [] }],
        parameters: [
            { name: "id", in: "path", required: true, schema: { type: "integer" } }
        ],
        requestBody: {
            required: true,
            content: { 
                "application/json": { 
                    schema: { 
                        type: "object",
                        properties: {
                            categoria: { type: "string" },
                            titulo: { type: "string" },
                            preco: { type: "number" },
                            quantidade_disponivel: { type: "integer" },
                            descricao: { type: "string" },
                            foto_produto: { type: "string" },
                            status: { type: "string" }
                        }
                    } 
                } 
            }
        },
        responses: {
            200: { 
                description: "Anúncio atualizado com sucesso." 
            },
            404: { 
                description: "O anúncio não existe ou você não tem permissão para editá-lo." 
            },
            500: { 
                description: "Falha na cláusula UPDATE da tabela 'Anuncios'." 
            }
        }
    },
    delete: {
        summary: "Deletar um anúncio (Apenas o dono)",
        tags: ["Anúncios"],
        security: [{ bearerAuth: [] }],
        parameters: [
            { name: "id", in: "path", required: true, schema: { type: "integer" } }
        ],
        responses: {
            200: { 
                description: "O anúncio foi permanentemente removido da plataforma." 
            },
            404: { 
                description: "ID inexistente ou anúncio pertence a outro usuário." 
            },
            500: { 
                description: "Erro crítico ao tentar remover o registro." 
            }
        }
    }
},

        // ==========================================
        // ROTAS DE FAVORITOS (Nova!)
        // ==========================================
        "/api/favoritos": {
            post: {
                summary: "Adicionar um anúncio aos favoritos",
                tags: ["Favoritos"],
                security: [{ bearerAuth: [] }],
                requestBody: {
                    required: true,
                    content: {
                        "application/json": {
                            schema: {
                                type: "object",
                                properties: {
                                    id_anuncio: { type: "integer" }
                                },
                                required: ["id_anuncio"]
                            }
                        }
                    }
                },
                responses: {
                    201: { description: "Anúncio favoritado com sucesso." },
                    400: { description: "Anúncio já favoritado ou inexistente." }
                }
            },
            get: {
                summary: "Listar favoritos do usuário logado",
                tags: ["Favoritos"],
                security: [{ bearerAuth: [] }],
                responses: {
                    200: { description: "Lista de favoritos retornada com sucesso." }
                }
            }
        },
        "/api/favoritos/{id_anuncio}": {
            delete: {
                summary: "Remover um anúncio dos favoritos",
                tags: ["Favoritos"],
                security: [{ bearerAuth: [] }],
                parameters: [{ name: "id_anuncio", in: "path", required: true, schema: { type: "integer" } }],
                responses: {
                    200: { description: "Removido dos favoritos com sucesso." }
                }
            }
        },

        // ==========================================
        // ROTAS DE CHATS E MENSAGENS
        // ==========================================
        "/api/chats": {
            post: {
                summary: "Iniciar ou recuperar uma sala de chat",
                tags: ["Chats"],
                security: [{ bearerAuth: [] }],
                requestBody: {
                    required: true,
                    content: {
                        "application/json": {
                            schema: {
                                type: "object",
                                properties: {
                                    id_produto: { type: "integer", description: "ID do produto/anúncio" },
                                    id_vendedor: { type: "integer", description: "ID do vendedor obtido no anúncio" }
                                },
                                required: ["id_produto", "id_vendedor"]
                            }
                        }
                    }
                },
                responses: {
                    201: { description: "Sala de chat localizada ou criada com sucesso (respeitando a CONSTRAINT unique_chat_produto)." },
                    500: { description: "Erro interno ao processar o chat." }
                }
            },
            get: {
                summary: "Listar todas as conversas do usuário (como comprador ou vendedor)",
                tags: ["Chats"],
                security: [{ bearerAuth: [] }],
                responses: {
                    200: { description: "Lista de chats carregada." }
                }
            }
        },
        "/api/chats/{id_chat}/mensagens": {
            post: {
                summary: "Enviar uma nova mensagem na conversa",
                tags: ["Chats"],
                security: [{ bearerAuth: [] }],
                parameters: [{ name: "id_chat", in: "path", required: true, schema: { type: "integer" } }],
                requestBody: {
                    required: true,
                    content: {
                        "application/json": {
                            schema: {
                                type: "object",
                                properties: {
                                    conteudo: { type: "string" }
                                },
                                required: ["conteudo"]
                            }
                        }
                    }
                },
                responses: {
                    201: { description: "Mensagem inserida na tabela Mensagens e engatilhada na tabela Notificacoes." }
                }
            },
            get: {
                summary: "Obter o histórico de mensagens de um chat",
                tags: ["Chats"],
                security: [{ bearerAuth: [] }],
                parameters: [{ name: "id_chat", in: "path", required: true, schema: { type: "integer" } }],
                responses: {
                    200: { description: "Histórico de mensagens ordenado por data." }
                }
            }
        },

        // ==========================================
        // ROTAS DE NOTIFICAÇÕES (Nova!)
        // ==========================================
        "/api/notificacoes": {
            get: {
                summary: "Listar notificações do usuário (Sininho)",
                tags: ["Notificações"],
                security: [{ bearerAuth: [] }],
                responses: {
                    200: { description: "Lista de notificações pendentes e lidas." }
                }
            }
        },
        "/api/notificacoes/{id}/ler": {
            put: {
                summary: "Marcar uma notificação como lida",
                tags: ["Notificações"],
                security: [{ bearerAuth: [] }],
                parameters: [{ name: "id", in: "path", required: true, schema: { type: "integer" } }],
                responses: {
                    200: { description: "Notificação atualizada para lida = true." }
                }
            }
        },

        // ==========================================
        // ROTAS DE VENDAS
        // ==========================================
        "/api/vendas": {
            post: {
                summary: "Registrar uma nova transação de venda",
                tags: ["Vendas"],
                security: [{ bearerAuth: [] }],
                requestBody: {
                    required: true,
                    content: {
                        "application/json": {
                            schema: {
                                type: "object",
                                properties: {
                                    id_anuncio: { type: "integer" },
                                    id_vendedor: { type: "integer" },
                                    id_comprador: { type: "integer", description: "ID do comprador (Login)" },
                                    quantidade_comprada: { type: "integer", default: 1 },
                                    valor_total: { type: "number" },
                                    status_pagamento: { type: "string", enum: ["Pendente", "Pago", "Cancelado"], default: "Pendente" },
                                    status_entrega: { type: "string", enum: ["Processando", "Enviado", "Entregue", "Cancelado"], default: "Processando" }
                                },
                                required: ["id_anuncio", "id_vendedor", "id_comprador", "valor_total"]
                            }
                        }
                    }
                },
                responses: {
                    201: { description: "Venda registrada com sucesso no histórico da tabela Vendas." },
                    400: { description: "Erro de validação com os ENUMs de status ou chaves estrangeiras." }
                }
            }
        },
        "/api/vendas/compras": {
            get: {
                summary: "Histórico de compras (onde o usuário é id_comprador)",
                tags: ["Vendas"],
                security: [{ bearerAuth: [] }],
                responses: {
                    200: { description: "Histórico de compras carregado." }
                }
            }
        },
        "/api/vendas/pedidos": {
            get: {
                summary: "Histórico de pedidos recebidos (onde o usuário é id_vendedor)",
                tags: ["Vendas"],
                security: [{ bearerAuth: [] }],
                responses: {
                    200: { description: "Lista de vendas realizadas carregada." }
                }
            }
        },
        "/api/vendas/{id}": {
            put: {
                summary: "Atualizar os status de pagamento ou entrega de uma venda",
                tags: ["Vendas"],
                security: [{ bearerAuth: [] }],
                parameters: [{ name: "id", in: "path", required: true, schema: { type: "integer" } }],
                requestBody: {
                    required: true,
                    content: {
                        "application/json": {
                            schema: {
                                type: "object",
                                properties: {
                                    status_pagamento: { type: "string", enum: ["Pendente", "Pago", "Cancelado"] },
                                    status_entrega: { type: "string", enum: ["Processando", "Enviado", "Entregue", "Cancelado"] }
                                }
                            }
                        }
                    }
                },
                responses: {
                    200: { description: "Status atualizados com sucesso." },
                    400: { description: "Status enviado inválido conforme restrições do banco." }
                }
            }
        }
    }
};

export default documentacao;