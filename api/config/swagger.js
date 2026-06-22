const documentacao = {
  openapi: "3.0.3",
  info: {
    title: "API ConectaAgro",
    description: "API integrada do ecossistema ConectaAgro: gerenciamento de usuários, perfis, produtos e agendamentos.",
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
        description: "Insira o Token obtido no login. Não digite a palavra 'Bearer ', o Swagger adiciona automaticamente."
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
      }
    }
  },
  security: [
    {
      bearerAuth: []
    }
  ],
  tags: [
    { name: "Usuários", description: "Gerenciamento de contas e login" },
    { name: "Perfil", description: "Informações detalhadas do perfil dos utilizadores" },
    { name: "Produtos", description: "Catálogo de mercadorias agrícolas anunciado pelos vendedores" },
    { name: "Agendamentos", description: "Visitas e intenções de compra de produtos" }
  ],
  paths: {
    "/usuarios/usuarios/login": {
      "post": {
        "tags": ["Usuários"],
        "summary": "Efetuar login na API",
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
          "401": { "description": "E-mail, senha ou tipo de usuário incorretos." },
          "500": { "description": "Erro interno no servidor." }
        }
      }
    },
    "/usuarios/usuarios": {
      "get": {
        "tags": ["Usuários"],
        "summary": "Listar todos os usuários cadastrados",
        "responses": {
          "200": {
            "description": "Lista de usuários cadastrados.",
            "content": {
              "application/json": {
                "schema": { "type": "array", "items": { "$ref": "#/components/schemas/UsuarioResponse" } }
              }
            }
          }
        }
      },
      "post": {
        "tags": ["Usuários"],
        "summary": "Cadastrar novo usuário",
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
          "201": { "description": "Registro de usuário realizado com sucesso." },
          "400": { "description": "Este e-mail já está cadastrado ou campos em falta." },
          "500": { "description": "Erro interno no servidor." }
        }
      }
    },
    "/usuarios/usuarios/{id}": {
      "put": {
        "tags": ["Usuários"],
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
          "200": { "description": "Dados atualizados com sucesso." },
          "404": { "description": "Usuário não encontrado." },
          "500": { "description": "Erro interno no servidor." }
        }
      },
      "delete": {
        "tags": ["Usuários"],
        "summary": "Excluir permanentemente um usuário",
        "parameters": [
          { "name": "id", "in": "path", "required": true, "schema": { "type": "integer" } }
        ],
        "responses": {
          "200": { "description": "Usuário excluído permanentemente." },
          "404": { "description": "Usuário não encontrado." },
          "500": { "description": "Erro interno no servidor." }
        }
      }
    },
    "/perfil": {
      "get": {
        "tags": ["Perfil"],
        "summary": "Buscar perfil do usuário logado (via Token)",
        "responses": {
          "200": {
            "description": "Perfil retornado com sucesso.",
            "content": {
              "application/json": {
                "schema": { "$ref": "#/components/schemas/PerfilResponse" }
              }
            }
          },
          "404": { "description": "Perfil não encontrado." },
          "500": { "description": "Erro interno ao buscar perfil." }
        }
      },
      "post": {
        "tags": ["Perfil"],
        "summary": "Criar perfil para o usuário logado (via Token)",
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
          "201": { "description": "Perfil criado com sucesso!" },
          "400": { "description": "Campos obrigatórios ausentes ou perfil já cadastrado." },
          "500": { "description": "Erro interno ao salvar perfil." }
        }
      },
      "put": {
        "tags": ["Perfil"],
        "summary": "Atualizar dados do perfil próprio (via Token)",
        "requestBody": {
          "required": true,
          "content": {
            "application/json": {
              "schema": {
                "type": "object",
                "required": ["nome_completo", "tipo_usuario"],
                "properties": {
                  "nome_completo": { "type": "string", "example": "João Modificado" },
                  "telefone": { "type": "string", "example": "11988887777" },
                  "nome_fazenda_ou_empresa": { "type": "string", "example": "Nova Fazenda Sol" },
                  "cpf_cnpj": { "type": "string", "example": "123.456.789-00" },
                  "tipo_usuario": { "type": "string", "example": "vendedor" }
                }
              }
            }
          }
        },
        "responses": {
          "200": { "description": "Perfil atualizado com sucesso!" },
          "400": { "description": "Os campos nome_completo e tipo_usuario são obrigatórios." },
          "404": { "description": "Perfil não encontrado para atualização." },
          "500": { "description": "Erro interno ao atualizar perfil." }
        }
      }
    },
    "/perfil/{usuario_id}": {
      "put": {
        "tags": ["Perfil"],
        "summary": "Atualizar perfil validando ID do parâmetro com o Token",
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
          "200": { "description": "Perfil updated com sucesso!" },
          "400": { "description": "usuario_id inválido ou campos obrigatórios ausentes." },
          "403": { "description": "Acesso negado. Só é possível alterar o próprio perfil." },
          "404": { "description": "Perfil não encontrado para atualização." },
          "500": { "description": "Erro interno ao atualizar perfil." }
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
                "schema": { "type": "array", "items": { "$ref": "#/components/schemas/Produto" } }
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
                "required": ["categoria", "nome_produto", "quantidade_disponivel", "preco", "estado", "cidade", "cep", "prazo_entrega"],
                "properties": {
                  "categoria": { "type": "string", "example": "Rações" },
                  "nome_produto": { "type": "string", "example": "Ração Bovinos 22%" },
                  "marca": { "type": "string", "example": "Nutribon" },
                  "unidade": { "type": "string", "example": "Saco 40kg" },
                  "quantidade_disponivel": { "type": "integer", "example": 50 },
                  "preco": { "type": "number", "example": 120.00 },
                  "descricao": { "type": "string", "example": "Descrição detalhada" },
                  "foto_produto": { "type": "string", "example": "https://link.com/foto.jpg" },
                  "estado": { "type": "string", "example": "São Paulo" },
                  "cidade": { "type": "string", "example": "Andradina" },
                  "cep": { "type": "string", "example": "16900-000" },
                  "prazo_entrega": { "type": "string", "example": "3 dias" },
                  "tipo_anuncio": { "type": "string", "example": "Novo" }
                }
              }
            }
          }
        },
        "responses": {
          "201": { "description": "Produto cadastrado com sucesso." }
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
          "200": { "description": "Sucesso" },
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
                  "preco": { "type": "number", "example": 130.00 },
                  "quantidade_disponivel": { "type": "integer", "example": 100 }
                }
              }
            }
          }
        },
        "responses": {
          "200": { "description": "Produto atualizado com sucesso." }
        }
      },
      "delete": {
        "tags": ["Produtos"],
        "summary": "Remover produto por ID",
        "parameters": [
          { "name": "id", "in": "path", "required": true, "schema": { "type": "integer" } }
        ],
        "responses": {
          "200": { "description": "Produto excluído com sucesso." }
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
                  "items": {
                    "type": "object",
                    "properties": {
                      "id": { "type": "integer", "example": 1 },
                      "id_produto": { "type": "integer", "example": 4 },
                      "observacoes": { "type": "string", "example": "Quero combinar a entrega." }
                    }
                  }
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
                  "id_produto": { "type": "integer", "example": 4 },
                  "observacoes": { "type": "string", "example": "Quero combinar a entrega da ração." }
                }
              }
            }
          }
        },
        "responses": {
          "201": { "description": "Agendamento registrado com sucesso." }
        }
      }
    }
  }
};

export default documentacao;