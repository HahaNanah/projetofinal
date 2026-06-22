
const documentacao = {
  openapi: "3.0.3",
  info: {
    title: "API ConectaAgro - Simplificada",
    description: "API para o ecossistema ConectaAgro: gerenciamento de usuários, perfis, produtos e agendamentos.",
    version: "1.0.0"
  },
  servers: [
    {
      url: "https://projetofinal-teal.vercel.app/api",
      description: "Servidor de Produção Vercel"
    },
  ],
  components: {
    securitySchemes: {
      bearerAuth: {
        type: "http",
        scheme: "bearer",
        bearerFormat: "JWT",
        description: "Insira o Token JWT obtido no login. Não digite a palavra 'Bearer ', o Swagger adiciona automaticamente."
      }
    },
    schemas: {
      UsuarioResponse: {
        type: "object",
        properties: {
          id: { type: "integer", example: 1 },
          email: { type: "string", example: "usuario@email.com" },
          tipo_usuario: { type: "string", example: "vendedor" }
        }
      },
      PerfilResponse: {
        type: "object",
        properties: {
          usuario_id: { type: "integer", example: 1 },
          email: { type: "string", example: "usuario@email.com" },
          nome_completo: { type: "string", example: "João da Silva" },
          telefone: { type: "string", example: "11999998888" },
          nome_fazenda_ou_empresa: { type: "string", example: "Fazenda Sol Nascente" },
          cpf_cnpj: { type: "string", example: "123.456.789-00" },
          tipo_usuario: { type: "string", example: "vendedor" }
        }
      },
      Produto: {
        type: "object",
        properties: {
          id: { type: "integer", example: 1 },
          vendedor_id: { type: "integer", example: 2 },
          categoria: { type: "string", example: "Rações" },
          nome_produto: { type: "string", example: "Ração para Bovinos de Leite" },
          marca: { type: "string", example: "Nutribon" },
          unidade: { type: "string", example: "Saco 40kg" },
          quantidade_disponivel: { type: "integer", example: 80 },
          preco: { type: "number", example: 125.00 },
          descricao: { type: "string", example: "Ração de alta qualidade." },
          foto_produto: { type: "string", example: "https://link.com/foto.jpg" },
          estado: { type: "string", example: "São Paulo" },
          cidade: { type: "string", example: "Andradina" },
          localizacao_detalhada: { type: "string", example: "Fazenda Boa Vista" },
          cep: { type: "string", example: "16900-000" },
          frete: { type: "string", example: "A combinar" },
          prazo_entrega: { type: "string", example: "5 dias" },
          tipo_anuncio: { type: "string", example: "Novo" },
          status: { type: "string", example: "Ativo" },
          destaque: { type: "boolean", example: false }
        }
      },
      AgendamentoResponse: {
        type: "object",
        properties: {
          id: { type: "integer", example: 1 },
          id_comprador: { type: "integer", example: 3 },
          id_produto: { type: "integer", example: 1 },
          status_agendamento: { type: "string", example: "Pendente" },
          data_agendamento: { type: "string", format: "date-time" },
          observacoes: { type: "string", example: "Olá! Gostaria de agendar para conversar..." }
        }
      }
    }
  },
  security: [
    {
      bearerAuth: []
    }
  ],
  tags: [
    { name: "Usuários & Autenticação", description: "Gerenciamento de contas e login" },
    { name: "Perfil", description: "Informações detalhadas do perfil dos utilizadores" },
    { name: "Produtos", description: "Catálogo de mercadorias agrícolas anunciado pelos vendedores" },
    { name: "Agendamentos", description: "Visitas e intenções de compra de produtos" }
  ],
  paths: {
    "/usuarios/login": {
      "post": {
        "tags": ["Usuários & Autenticação"],
        "summary": "Efetuar login na API (Gerar Token JWT)",
        "security": [],
        "requestBody": {
          "required": true,
          "content": {
            "application/json": {
              "schema": {
                "type": "object",
                "required": ["email", "senha", "tipo_usuario"],
                "properties": {
                  "email": { "type": "string", "example": "vendedor@email.com" },
                  "senha": { "type": "string", "example": "123" },
                  "tipo_usuario": { "type": "string", "example": "vendedor" }
                }
              }
            }
          }
        },
        "responses": {
          "200": {
            "description": "Autenticação efetuada com sucesso.",
            "content": {
              "application/json": {
                "schema": {
                  "type": "object",
                  "properties": {
                    "message": { "type": "string", "example": "Autenticação efetuada com sucesso." },
                    "usuario": { "$ref": "#/components/schemas/UsuarioResponse" },
                    "token": { "type": "string", "example": "eyJhbGciOiJIUzI1Ni..." }
                  }
                }
              }
            }
          },
          "401": { "description": "E-mail, senha ou tipo de utilizador incorretos." }
        }
      }
    },
    "/usuarios": {
      "get": {
        "tags": ["Usuários & Autenticação"],
        "summary": "Listar todos os utilizadores",
        "responses": {
          "200": {
            "description": "Sucesso",
            "content": {
              "application/json": {
                "schema": { "type": "array", "items": { "$ref": "#/components/schemas/UsuarioResponse" } }
              }
            }
          }
        }
      },
      "post": {
        "tags": ["Usuários & Autenticação"],
        "summary": "Cadastrar novo utilizador",
        "security": [],
        "requestBody": {
          "required": true,
          "content": {
            "application/json": {
              "schema": {
                "type": "object",
                "required": ["email", "senha", "tipo_usuario"],
                "properties": {
                  "email": { "type": "string", "example": "novo_usuario@email.com" },
                  "senha": { "type": "string", "example": "senha123" },
                  "tipo_usuario": { "type": "string", "example": "comprador" }
                }
              }
            }
          }
        },
        "responses": {
          "201": { "description": "Registo efetuado com sucesso." },
          "400": { "description": "Este e-mail já está cadastrado ou parâmetros em falta." }
        }
      }
    },
    "/usuarios/{id}": {
      "put": {
        "tags": ["Usuários & Autenticação"],
        "summary": "Atualizar credenciais de um usuário",
        "parameters": [
          { "name": "id", "in": "path", "required": true, "schema": { "type": "integer" } }
        ],
        "requestBody": {
          "required": true,
          "content": {
            "application/json": {
              "schema": {
                "type": "object",
                "required": ["email", "senha", "tipo_usuario"],
                "properties": {
                  "email": { "type": "string", "example": "atualizado@email.com" },
                  "senha": { "type": "string", "example": "nova_senha" },
                  "tipo_usuario": { "type": "string", "example": "vendedor" }
                }
              }
            }
          }
        },
        "responses": {
          "200": { "description": "Dados de login atualizados." },
          "404": { "description": "Usuário não localizado." }
        }
      },
      "delete": {
        "tags": ["Usuários & Autenticação"],
        "summary": "Excluir permanentemente um usuário",
        "parameters": [
          { "name": "id", "in": "path", "required": true, "schema": { "type": "integer" } }
        ],
        "responses": {
          "200": { "description": "Usuário removido do sistema." },
          "404": { "description": "Usuário não localizado." }
        }
      }
    },
    "/perfil": {
      "get": {
        "tags": ["Perfil"],
        "summary": "Buscar perfil do usuário autenticado no token",
        "responses": {
          "200": {
            "description": "Perfil retornado com sucesso.",
            "content": {
              "application/json": {
                "schema": { "$ref": "#/components/schemas/PerfilResponse" }
              }
            }
          },
          "404": { "description": "Perfil não encontrado para o ID fornecido no token." },
          "500": { "description": "Erro interno ao buscar perfil." }
        }
      },
      "post": {
        "tags": ["Perfil"],
        "summary": "Criar perfil para o usuário autenticado",
        "requestBody": {
          "required": true,
          "content": {
            "application/json": {
              "schema": {
                "type": "object",
                "required": ["nome_completo", "tipo_usuario"],
                "properties": {
                  "nome_completo": { "type": "string", "example": "João da Silva" },
                  "telefone": { "type": "string", "example": "11999998888" },
                  "nome_fazenda_ou_empresa": { "type": "string", "example": "Fazenda Sol Nascente" },
                  "cpf_cnpj": { "type": "string", "example": "123.456.789-00" },
                  "tipo_usuario": { "type": "string", "example": "vendedor" }
                }
              }
            }
          }
        },
        "responses": {
          "201": { "description": "Perfil registrado com sucesso!" },
          "400": { "description": "Perfil existente ou parâmetros obrigatórios ausentes." },
          "500": { "description": "Erro interno ao salvar perfil." }
        }
      },
      "put": {
        "tags": ["Perfil"],
        "summary": "Atualizar dados do perfil próprio",
        "requestBody": {
          "required": true,
          "content": {
            "application/json": {
              "schema": {
                "type": "object",
                "required": ["nome_completo", "tipo_usuario"],
                "properties": {
                  "nome_completo": { "type": "string", "example": "João Modificado da Silva" },
                  "telefone": { "type": "string", "example": "11988887777" },
                  "nome_fazenda_ou_empresa": { "type": "string", "example": "Nova Fazenda Sol Nascente" },
                  "cpf_cnpj": { "type": "string", "example": "123.456.789-00" },
                  "tipo_usuario": { "type": "string", "example": "vendedor" }
                }
              }
            }
          }
        },
        "responses": {
          "200": { "description": "Perfil atualizado com sucesso!" },
          "400": { "description": "Campos obrigatórios ausentes." },
          "404": { "description": "Perfil não encontrado para atualização." },
          "500": { "description": "Erro interno ao modificar perfil." }
        }
      }
    },
    "/perfil/{usuario_id}": {
      "put": {
        "tags": ["Perfil"],
        "summary": "Atualizar perfil por ID (Verifica propriedade)",
        "parameters": [
          { "name": "usuario_id", "in": "path", "required": true, "schema": { "type": "integer" } }
        ],
        "requestBody": {
          "required": true,
          "content": {
            "application/json": {
              "schema": {
                "type": "object",
                "required": ["nome_completo", "tipo_usuario"],
                "properties": {
                  "nome_completo": { "type": "string", "example": "João Silva Param" },
                  "telefone": { "type": "string", "example": "11999998888" },
                  "nome_fazenda_ou_empresa": { "type": "string", "example": "Fazenda Parâmetro" },
                  "cpf_cnpj": { "type": "string", "example": "123.456.789-00" },
                  "tipo_usuario": { "type": "string", "example": "vendedor" }
                }
              }
            }
          }
        },
        "responses": {
          "200": { "description": "Perfil modificado com sucesso!" },
          "400": { "description": "Parâmetro inválido ou campos ausentes." },
          "403": { "description": "Acesso negado. Só é possível alterar o próprio perfil." },
          "404": { "description": "Perfil não localizado no banco." },
          "500": { "description": "Erro interno do servidor." }
        }
      }
    },
    "/produtos": {
      "get": {
        "tags": ["Produtos"],
        "summary": "Listar todos os produtos",
        "responses": {
          "200": {
            "description": "Lista carregada com sucesso",
            "content": {
              "application/json": {
                "schema": {
                  "type": "array",
                  "items": { "$ref": "#/components/schemas/Produto" }
                }
              }
            }
          }
        }
      },
      "post": {
        "tags": ["Produtos"],
        "summary": "Cadastrar um produto",
        "requestBody": {
          "required": true,
          "content": {
            "application/json": {
              "schema": {
                "type": "object",
                "required": ["categoria", "nome_produto", "quantidade_disponivel", "preco", "estado", "cidade", "cep", "prazo_entrega", "tipo_anuncio"],
                "properties": {
                  "categoria": { "type": "string", "example": "Rações" },
                  "nome_produto": { "type": "string", "example": "Ração Bovinos 22%" },
                  "marca": { "type": "string", "example": "Nutribon" },
                  "unidade": { "type": "string", "example": "Saco 40kg" },
                  "quantidade_disponivel": { "type": "integer", "example": 50 },
                  "preco": { "type": "number", "example": 120.00 },
                  "descricao": { "type": "string", "example": "Descrição do produto" },
                  "foto_produto": { "type": "string", "example": "https://link.com/foto.jpg" },
                  "estado": { "type": "string", "example": "São Paulo" },
                  "cidade": { "type": "string", "example": "Andradina" },
                  "localizacao_detalhada": { "type": "string", "example": "Km 10" },
                  "cep": { "type": "string", "example": "16900-000" },
                  "frete": { "type": "string", "example": "A combinar" },
                  "prazo_entrega": { "type": "string", "example": "3 dias" },
                  "tipo_anuncio": { "type": "string", "enum": ["Novo", "Seminovo"], "example": "Novo" },
                  "destaque": { "type": "boolean", "example": false }
                }
              }
            }
          }
        },
        "responses": {
          "201": { "description": "Produto cadastrado com sucesso." },
          "400": { "description": "Dados incorretos ou em falta." }
        }
      }
    },
    "/produtos/{id}": {
      "get": {
        "tags": ["Produtos"],
        "summary": "Buscar produto por ID",
        "parameters": [
          { "name": "id", "in": "path", "required": true, "schema": { "type": "integer" } }
        ],
        "responses": {
          "200": { 
            "description": "Sucesso",
            "content": {
              "application/json": { "schema": { "$ref": "#/components/schemas/Produto" } }
            }
          },
          "404": { "description": "Produto não encontrado." }
        }
      },
      "put": {
        "tags": ["Produtos"],
        "summary": "Atualizar produto por ID",
        "parameters": [
          { "name": "id", "in": "path", "required": true, "schema": { "type": "integer" } }
        ],
        "requestBody": {
          "required": true,
          "content": {
            "application/json": {
              "schema": {
                "type": "object",
                "properties": {
                  "categoria": { "type": "string", "example": "Rações" },
                  "nome_produto": { "type": "string", "example": "Trator Reformado" },
                  "preco": { "type": "number", "example": 85000.00 },
                  "tipo_anuncio": { "type": "string", "enum": ["Novo", "Seminovo"], "example": "Seminovo" }
                }
              }
            }
          }
        },
        "responses": {
          "200": { "description": "Produto atualizado com sucesso." },
          "404": { "description": "Produto não encontrado." }
        }
      },
      "delete": {
        "tags": ["Produtos"],
        "summary": "Remover produto por ID",
        "parameters": [
          { "name": "id", "in": "path", "required": true, "schema": { "type": "integer" } }
        ],
        "responses": {
          "200": { "description": "Produto excluído com sucesso." },
          "404": { "description": "Produto não encontrado." }
        }
      }
    },
    "/agendamentos": {
      "get": {
        "tags": ["Agendamentos"],
        "summary": "Listar todos os agendamentos registrados",
        "responses": {
          "200": {
            "description": "Lista de agendamentos.",
            "content": {
              "application/json": {
                "schema": {
                  "type": "array",
                  "items": { "$ref": "#/components/schemas/AgendamentoResponse" }
                }
              }
            }
          }
        }
      },
      "post": {
        "tags": ["Agendamentos"],
        "summary": "Criar um novo agendamento",
        "requestBody": {
          "required": true,
          "content": {
            "application/json": {
              "schema": {
                "type": "object",
                "required": ["id_produto"],
                "properties": {
                  "id_produto": { "type": "integer", "example": 1 },
                  "observacoes": { "type": "string", "example": "Quero combinar a entrega da ração." }
                }
              }
            }
          }
        },
        "responses": {
          "201": { "description": "Agendamento registrado com sucesso." },
          "400": { "description": "Parâmetro 'id_produto' ausente." }
        }
      }
    }
  }
};

export default documentacao;
