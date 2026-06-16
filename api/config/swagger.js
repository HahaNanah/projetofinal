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
        { name: "Usuarios", description: "Gerenciamento de usuarios e autenticação" },
        { name: "Perfil", description: "Gerenciamento de informações do perfil do usuário" },
        { name: "Produtos", description: "Gerenciamento do catálogo de produtos" },
        { name: "Categorias", description: "Gerenciamento das categorias de produtos" },
        { name: "Agendamentos", description: "Gerenciamento de visitas e negociações de produtos" }
    ],
    paths: {
        "/usuarios": {
            get: {
                tags: ["Usuarios"],
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
                tags: ["Usuarios"],
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
        "/auth/login": {
            post: {
                tags: ["Usuarios"],
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
        "/usuarios/{id}": {
            put: {
                tags: ["Usuarios"],
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
                tags: ["Usuarios"],
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
    }
};

export default documentacao;