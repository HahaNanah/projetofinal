export default {
  "openapi": "3.0.3",
  "info": {
    "title": "API ConectaAgro",
    "description": "API para gerenciamento de produtos agrícolas, categorias, usuários e perfis.",
    "version": "1.0.0"
  },
  "servers": [
    {
      "url": "https://projetofinal-teal.vercel.app/api",
      "description": "Servidor de Produção Vercel"
    },
    {
      "url": "http://localhost:3000/api",
      "description": "Servidor do Ambiente Local"
    }
  ],
  "components": {
    "securitySchemes": {
      "bearerAuth": {
        "type": "http",
        "scheme": "bearer",
        "bearerFormat": "JWT",
        "description": "Token JWT para autenticação. Cole APENAS o token gerado no login (o Swagger adiciona o 'Bearer' automaticamente)."
      }
    },
    "schemas": {
      "UsuarioResponse": {
        "type": "object",
        "properties": {
          "id": { "type": "integer", "example": 1 },
          "email": { "type": "string", "example": "vendedor@email.com" },
          "tipo_usuario": { "type": "string", "example": "vendedor" }
        }
      },
      "Perfil": {
        "type": "object",
        "properties": {
          "usuario_id": { "type": "integer", "example": 2 },
          "nome_completo": { "type": "string", "example": "João da Silva" },
          "telefone": { "type": "string", "example": "(18) 99999-1111" },
          "nome_fazenda_ou_empresa": { "type": "string", "example": "Fazenda Boa Vista" },
          "cpf_cnpj": { "type": "string", "example": "12.345.678/0001-99" },
          "tipo_usuario": { "type": "string", "example": "vendedor" }
        }
      },
      "Produto": {
        "type": "object",
        "properties": {
          "id": { "type": "integer", "example": 1 },
          "vendedor_id": { "type": "integer", "example": 2 },
          "categoria": { "type": "string", "example": "Gados" },
          "nome_produto": { "type": "string", "example": "Garrote Nelore PO" },
          "preco": { "type": "number", "example": 3200.00 },
          "quantidade_disponivel": { "type": "integer", "example": 15 },
          "cidade": { "type": "string", "example": "Rondonópolis" }
        }
      },
      "ErroPadrao": {
        "type": "object",
        "properties": {
          "error": { "type": "string", "example": "ForbiddenError: Operação não permitida." },
          "message": { "type": "string", "example": "O ID fornecido na URL não corresponde ao Token autenticado." }
        }
      }
    }
  },
  "security": [
    {
      "bearerAuth": []
    }
  ],
  "tags": [
    { "name": "Usuários", "description": "Gerenciamento de usuários e acessos" },
    { "name": "Perfil", "description": "Gerenciamento de informações do perfil do usuário" },
    { "name": "Produtos", "description": "Gerenciamento do catálogo de produtos" },
    { "name": "Categorias", "description": "Gerenciamento das categorias de produtos" },
    { "name": "Agendamentos", "description": "Gerenciamento de visitas e negociações de produtos" }
  ],
  "paths": {
    "/login": {
      "get": {
        "tags": ["Usuários"],
        "summary": "Lista todos os usuários cadastrados",
        "responses": {
          "200": {
            "description": "Lista de usuários retornada com sucesso.",
            "content": {
              "application/json": {
                "schema": {
                  "type": "array",
                  "items": { "$ref": "#/components/schemas/UsuarioResponse" }
                }
              }
            }
          },
          "500": { "description": "Erro interno no servidor." }
        }
      },
      "post": {
        "tags": ["Usuários"],
        "summary": "Cadastra um novo usuário",
        "security": [],
        "requestBody": {
          "required": true,
          "content": {
            "application/json": {
              "schema": {
                "type": "object",
                "required": ["email", "senha", "tipo_usuario"],
                "properties": {
                  "email": { "type": "string", "example": "comprador@email.com" },
                  "senha": { "type": "string", "example": "123" },
                  "tipo_usuario": { "type": "string", "enum": ["vendedor", "comprador", "ambos"], "example": "comprador" }
                }
              }
            }
          }
        },
        "responses": {
          "201": {
            "description": "Cadastro feito com sucesso!",
            "content": {
              "application/json": {
                "schema": {
                  "type": "object",
                  "properties": {
                    "message": { "type": "string", "example": "Usuário cadastrado com sucesso!" },
                    "usuario": { "$ref": "#/components/schemas/UsuarioResponse" }
                  }
                }
              }
            }
          }
        }
      }
    },
    "/login/auth": {
      "post": {
        "tags": ["Usuários"],
        "summary": "Autentica usuário e retorna JWT Token",
        "description": "Faz login com email, senha e tipo de usuário, retornando um token JWT para usar nas rotas protegidas",
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
                  "tipo_usuario": { "type": "string", "enum": ["vendedor", "comprador", "ambos"], "example": "vendedor" }
                }
              }
            }
          }
        },
        "responses": {
          "200": {
            "description": "Autenticação bem-sucedida! Retorna usuário e token JWT.",
            "content": {
              "application/json": {
                "schema": {
                  "type": "object",
                  "properties": {
                    "message": { "type": "string", "example": "Login efetuado com sucesso!" },
                    "usuario": { "$ref": "#/components/schemas/UsuarioResponse" },
                    "token": { "type": "string", "example": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..." }
                  }
                }
              }
            }
          },
          "400": { "description": "Campos obrigatórios não foram preenchidos." },
          "401": { "description": "E-mail, senha ou tipo de usuário incorretos." }
        }
      }
    },
    "/login/{id}": {
      "put": {
        "tags": ["Usuários"],
        "summary": "Atualiza completamente um usuário por ID",
        "parameters": [
          { "name": "id", "in": "path", "required": true, "schema": { "type": "integer" }, "description": "ID do usuário" }
        ],
        "requestBody": {
          "required": true,
          "content": {
            "application/json": {
              "schema": {
                "type": "object",
                "required": ["email", "senha", "tipo_usuario"],
                "properties": {
                  "email": { "type": "string", "example": "vendedor_novo@email.com" },
                  "senha": { "type": "string", "example": "nova_senha123" },
                  "tipo_usuario": { "type": "string", "enum": ["vendedor", "comprador", "ambos"], "example": "vendedor" }
                }
              }
            }
          }
        },
        "responses": {
          "200": {
            "description": "Login atualizado com sucesso!",
            "content": {
              "application/json": {
                "schema": {
                  "type": "object",
                  "properties": {
                    "message": { "type": "string", "example": "Login atualizado com sucesso!" },
                    "usuario": { "type": "object" }
                  }
                }
              }
            }
          },
          "404": { "description": "Login não encontrado" }
        }
      },
      "delete": {
        "tags": ["Usuários"],
        "summary": "Deleta um usuário por ID",
        "parameters": [
          { "name": "id", "in": "path", "required": true, "schema": { "type": "integer" }, "description": "ID do usuário" }
        ],
        "responses": {
          "200": {
            "description": "Login removido com sucesso!",
            "content": {
              "application/json": {
                "schema": {
                  "type": "object",
                  "properties": {
                    "message": { "type": "string", "example": "Login removido com sucesso!" }
                  }
                }
              }
            }
          },
          "401": { "description": "Senha incorreta. Verifique sua senha e tente novamente." },
          "403": { "description": "Acesso bloqueado. Conta desativada ou sem permissão." },
          "500": { "description": "Erro interno no servidor ao tentar deletar." }
        }
      }
    },
    "/perfil": {
      "get": {
        "tags": ["Perfil"],
        "summary": "Buscar Perfil do Usuário Logado",
        "description": "Retorna os dados integrados do perfil baseado estritamente no Token JWT fornecido (sem ID na URL).",
        "responses": {
          "200": {
            "description": "Perfil retornado com sucesso trazendo dados integrados.",
            "content": {
              "application/json": {
                "schema": {
                  "type": "object",
                  "properties": {
                    "usuario_id": { "type": "integer", "example": 2 },
                    "email": { "type": "string", "example": "vendedor@email.com" },
                    "nome_completo": { "type": "string", "example": "João da Silva" },
                    "telefone": { "type": "string", "example": "(18) 99999-1111" },
                    "nome_fazenda_ou_empresa": { "type": "string", "example": "Fazenda Boa Vista" },
                    "cpf_cnpj": { "type": "string", "example": "12.345.678/0001-99" },
                    "tipo_usuario": { "type": "string", "example": "vendedor" }
                  }
                }
              }
            }
          },
          "401": { "description": "Você não está autenticado ou o token enviado é inválido." },
          "404": { "description": "Não foi possível encontrar o perfil solicitado para este token." },
          "500": { "description": "Erro interno no servidor ao buscar o perfil." }
        }
      }
    },
    "/perfil/{id}": {
      "put": {
        "tags": ["Perfil"],
        "summary": "Atualizar Perfil (Exige ID e Gera Novo Token)",
        "description": "Atualiza os dados do perfil e altera o tipo_usuario no banco. O ID na URL deve ser idêntico ao do Token. Devolve um 'token_atualizado' renovado.",
        "parameters": [
          { "name": "id", "in": "path", "required": true, "schema": { "type": "integer" }, "description": "ID do usuário para validação e atualização" }
        ],
        "requestBody": {
          "required": true,
          "content": {
            "application/json": {
              "schema": {
                "type": "object",
                "required": ["nome_completo", "tipo_usuario"],
                "properties": {
                  "nome_completo": { "type": "string", "example": "João da Silva Atualizado" },
                  "telefone": { "type": "string", "example": "(18) 99999-2222" },
                  "nome_fazenda_ou_empresa": { "type": "string", "example": "Nova Fazenda Vista Linda" },
                  "cpf_cnpj": { "type": "string", "example": "12.345.678/0001-99" },
                  "tipo_usuario": { "type": "string", "enum": ["vendedor", "comprador", "ambos"], "example": "vendedor" }
                }
              }
            }
          }
        },
        "responses": {
          "200": {
            "description": "Perfil e tipo de usuário atualizados com sucesso.",
            "content": {
              "application/json": {
                "schema": {
                  "type": "object",
                  "properties": {
                    "message": { "type": "string", "example": "Perfil e tipo de usuário atualizados com sucesso." },
                    "token_atualizado": { "type": "string", "description": "Novo Token JWT contendo o payload do tipo_usuario recém alterado." },
                    "perfil": { "$ref": "#/components/schemas/Perfil" }
                  }
                }
              }
            }
          },
          "400": { "description": "Parâmetros inválidos ou conflito de dados (CPF/CNPJ duplicado)." },
          "403": { "description": "ForbiddenError: O ID fornecido na URL não corresponde ao Token autenticado." },
          "404": { "description": "Perfil não encontrado." },
          "500": { "description": "Erro interno do servidor ao tentar atualizar." }
        }
      },
      "delete": {
        "tags": ["Perfil"],
        "summary": "Deleta o próprio perfil através do ID",
        "description": "Remove o perfil correspondente ao ID informado na URL caso ele coincida com o seu Token JWT logado.",
        "parameters": [
          { "name": "id", "in": "path", "required": true, "schema": { "type": "integer" }, "description": "ID do usuário dono do perfil" }
        ],
        "responses": {
          "200": {
            "description": "Perfil excluído com sucesso.",
            "content": {
              "application/json": {
                "schema": {
                  "type": "object",
                  "properties": { "message": { "type": "string", "example": "Seu perfil foi excluído com sucesso." } }
                }
              }
            }
          },
          "403": { "description": "ForbiddenError: Operação não permitida por divergência de Token." },
          "404": { "description": "Perfil não encontrado ou já deletado." },
          "500": { "description": "Erro interno do servidor ao tentar deletar." }
        }
      }
    },
    "/produtos": {
      "get": {
        "tags": ["Produtos"],
        "summary": "Lista todos os produtos agrícolas",
        "responses": {
          "200": {
            "description": "Lista de produtos carregada.",
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
        "summary": "Cadastra um novo produto agrícola",
        "description": "Cria um produto. Bloqueia se o usuário for comprador ou se o vendedor_id for divergente do Token.",
        "requestBody": {
          "required": true,
          "content": {
            "application/json": {
              "schema": {
                "type": "object",
                "required": ["vendedor_id", "categoria", "nome_produto", "quantidade_disponivel", "preco", "estado", "cidade", "cep", "prazo_entrega", "tipo_anuncio"],
                "properties": {
                  "vendedor_id": { "type": "integer", "example": 2 },
                  "categoria": { "type": "string", "example": "Rações" },
                  "nome_produto": { "type": "string", "example": "Ração para Bovinos de Leite 22%" },
                  "marca": { "type": "string", "example": "Nutribon" },
                  "unidade": { "type": "string", "example": "Saco 40kg" },
                  "quantidade_disponivel": { "type": "integer", "example": 80 },
                  "preco": { "type": "number", "example": 125.00 },
                  "descricao": { "type": "string", "example": "Ração de alta qualidade com 22% de proteína bruta." },
                  "foto_produto": { "type": "string", "example": "https://link.com/foto.jpg" },
                  "estado": { "type": "string", "example": "São Paulo" },
                  "cidade": { "type": "string", "example": "Andradina" },
                  "cep": { "type": "string", "example": "16900-000" },
                  "prazo_entrega": { "type": "string", "example": "5 dias úteis" },
                  "tipo_anuncio": { "type": "string", "example": "Novo" }
                }
              }
            }
          }
        },
        "responses": {
          "201": {
            "description": "Produto cadastrado com sucesso!",
            "content": {
              "application/json": {
                "schema": {
                  "type": "object",
                  "properties": {
                    "message": { "type": "string", "example": "Produto cadastrado com sucesso!" },
                    "produto": { "type": "object" }
                  }
                }
              }
            }
          },
          "403": { "description": "Compradores não podem criar anúncios ou falsificação de ID." }
        }
      }
    },
    "/produtos/{id}": {
      "get": {
        "tags": ["Produtos"],
        "summary": "Busca um produto específico pelo ID",
        "parameters": [
          { "name": "id", "in": "path", "required": true, "schema": { "type": "integer" }, "description": "ID do produto" }
        ],
        "responses": {
          "200": {
            "description": "Produto encontrado com sucesso.",
            "content": { "application/json": { "schema": { "type": "object" } } }
          },
          "404": { "description": "Produto não encontrado." }
        }
      },
      "put": {
        "tags": ["Produtos"],
        "summary": "Atualiza completamente um produto por ID",
        "parameters": [
          { "name": "id", "in": "path", "required": true, "schema": { "type": "integer" }, "description": "ID do produto" }
        ],
        "requestBody": {
          "required": true,
          "content": {
            "application/json": {
              "schema": {
                "type": "object",
                "properties": {
                  "categoria": { "type": "string", "example": "Máquinas" },
                  "nome_produto": { "type": "string", "example": "Trator Massey Ferguson 2024" },
                  "preco": { "type": "number", "example": 245000.00 },
                  "quantidade_disponivel": { "type": "integer", "example": 2 },
                  "cidade": { "type": "string", "example": "Andradina" }
                }
              }
            }
          }
        },
        "responses": {
          "200": { "description": "Produto atualizado com sucesso." },
          "404": { "description": "Produto não encontrado para atualização." }
        }
      },
      "delete": {
        "tags": ["Produtos"],
        "summary": "Remove permanentemente um produto por ID",
        "parameters": [
          { "name": "id", "in": "path", "required": true, "schema": { "type": "integer" }, "description": "ID do produto" }
        ],
        "responses": {
          "200": { "description": "Produto deletado com sucesso." },
          "404": { "description": "Produto não encontrado para exclusão." }
        }
      }
    },
    "/categorias": {
      "get": {
        "tags": ["Categorias"],
        "summary": "Lista todas as categorias de produtos",
        "responses": {
          "200": {
            "description": "Lista de categorias retornada com sucesso.",
            "content": {
              "application/json": {
                "schema": {
                  "type": "array",
                  "items": {
                    "type": "object",
                    "properties": {
                      "id": { "type": "integer", "example": 1 },
                      "nome_categoria": { "type": "string", "example": "Maquinários" }
                    }
                  }
                }
              }
            }
          }
        }
      },
      "post": {
        "tags": ["Categorias"],
        "summary": "Adiciona uma nova categoria",
        "requestBody": {
          "required": true,
          "content": {
            "application/json": {
              "schema": {
                "type": "object",
                "required": ["nome_categoria"],
                "properties": {
                  "nome_categoria": { "type": "string", "example": "Rações e Nutrição" }
                }
              }
            }
          }
        },
        "responses": {
          "201": {
            "description": "Categoria criada com sucesso!",
            "content": {
              "application/json": {
                "schema": {
                  "type": "object",
                  "properties": {
                    "mensagem": { "type": "string", "example": "Categoria criada com sucesso!" },
                    "dados": { "type": "object" }
                  }
                }
              }
            }
          }
        }
      }
    },
    "/categorias/{id}": {
      "put": {
        "tags": ["Categorias"],
        "summary": "Altera o nome de uma categoria existente por ID",
        "parameters": [
          { "name": "id", "in": "path", "required": true, "schema": { "type": "integer" }, "description": "ID da categoria" }
        ],
        "requestBody": {
          "required": true,
          "content": {
            "application/json": {
              "schema": {
                "type": "object",
                "required": ["nome_categoria"],
                "properties": {
                  "nome_categoria": { "type": "string", "example": "Implementos Agrícolas" }
                }
              }
            }
          }
        },
        "responses": {
          "200": { "description": "Categoria atualizada com sucesso." },
          "404": { "description": "Categoria não encontrada para atualização." }
        }
      },
      "delete": {
        "tags": ["Categorias"],
        "summary": "Deleta fisicamente uma categoria do banco por ID",
        "parameters": [
          { "name": "id", "in": "path", "required": true, "schema": { "type": "integer" }, "description": "ID da categoria" }
        ],
        "responses": {
          "200": { "description": "Categoria deletada com sucesso." },
          "404": { "description": "Categoria não encontrada para exclusão." }
        }
      }
    },
    "/agendamentos": {
      "get": {
        "tags": ["Agendamentos"],
        "summary": "Lista todos os agendamentos realizados",
        "responses": {
          "200": {
            "description": "Lista de agendamentos retornada com sucesso.",
            "content": {
              "application/json": {
                "schema": {
                  "type": "array",
                  "items": {
                    "type": "object",
                    "properties": {
                      "agendamento_id": { "type": "integer", "example": 1 },
                      "nome_comprador": { "type": "string", "example": "Carlos Souza" },
                      "nome_produto": { "type": "string", "example": "Ração para Bovinos de Leite 22%" },
                      "preco": { "type": "number", "example": 125.00 },
                      "data_agendamento": { "type": "string", "format": "date-time", "example": "2026-06-09T09:52:02.469Z" },
                      "status_agendamento": { "type": "string", "example": "Pendente" },
                      "observacoes": { "type": "string", "example": "Quero combinar a entrega da ração." }
                    }
                  }
                }
              }
            }
          },
          "500": { "description": "Erro interno no servidor ao tentar listar agendamentos." }
        }
      },
      "post": {
        "tags": ["Agendamentos"],
        "summary": "Cria um novo agendamento para um produto",
        "requestBody": {
          "required": true,
          "content": {
            "application/json": {
              "schema": {
                "type": "object",
                "required": ["id_comprador", "id_produto"],
                "properties": {
                  "id_comprador": { "type": "integer", "example": 48 },
                  "id_produto": { "type": "integer", "example": 4 },
                  "observacoes": { "type": "string", "example": "Quero combinar a entrega da ração." }
                }
              }
            }
          }
        },
        "responses": {
          "201": {
            "description": "Agendamento criado com sucesso!",
            "content": {
              "application/json": {
                "schema": {
                  "type": "object",
                  "properties": {
                    "message": { "type": "string", "example": "Agendamento realizado com sucesso!" },
                    "id_agendamento": { "type": "integer", "example": 12 }
                  }
                }
              }
            }
          },
          "400": { "description": "Dados fornecidos inválidos ou incompletos." },
          "500": { "description": "Erro interno no servidor ao tentar criar o agendamento." }
        }
      }
    }
  }
};
export default documentacao; 