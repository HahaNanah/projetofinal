## 🔐 Autenticação JWT no Swagger

### ✅ O que foi implementado:
1. ✔️ Configuração de Bearer Auth no Swagger
2. ✔️ JWT_SECRET agora usa variáveis de ambiente (.env)
3. ✔️ Rotas protegidas marcadas com `security: [{ bearerAuth: [] }]`
4. ✔️ Arquivo .gitignore criado para proteger .env

---

### 🚀 Como usar:

#### 1️⃣ **Configurar variáveis de ambiente**
Renomeie `.env.example` para `.env` e ajuste as chaves:
```env
JWT_SECRET=sua_chave_super_secreta_aqui
```

#### 2️⃣ **Iniciar a API**
```bash
npm start
```

#### 3️⃣ **Abrir Swagger**
Acesse: projetofinal-teal.vercel.app
#### 4️⃣ **Gerar um Token (POST /login)**
1. Chame o endpoint `/login` (POST) com:
```json
{
  "email": "usuario@email.com",
  "senha": "123456"
}
```
2. Você receberá um token (se suas rotas retornarem)

#### 5️⃣ **Usar o Token no Swagger**
1. Clique no botão **"Authorize 🔒"** no topo do Swagger
2. Cole seu token assim:
```
Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```
⚠️ **Importante:** Deve ter `"Bearer "` antes do token!

3. Clique em **Authorize** e depois **Close**

#### 6️⃣ **Pronto!**
Agora você pode testar as rotas protegidas (Perfil, Agendamentos, etc.)
O token será automaticamente enviado no header `Authorization`.

---

### 📋 Rotas Protegidas (requerem token):
- ✔️ POST `/perfil` - Cadastrar perfil
- ✔️ GET `/perfil/{usuario_id}` - Buscar perfil
- ✔️ PUT `/perfil/{usuario_id}` - Atualizar perfil

### 🟢 Rotas Públicas (NÃO precisam token):
- POST `/login` - Fazer login
- POST `/login` - Cadastrar novo usuário
- GET `/categorias` - Listar categorias
- GET `/produtos` - Listar produtos

---

### 🔧 Estrutura de Segurança:
```
autenticacao.js       → Middleware que valida o token
.env                  → Arquivo com JWT_SECRET (NUNCA commitar!)
swagger.js            → Documentação com securitySchemes configurado
app.js                → Carrega dotenv automaticamente
```

### 🚨 Checklist de Segurança:
- ✅ JWT_SECRET não está mais hardcoded
- ✅ .env está no .gitignore
- ✅ Middleware verifica Authorization header
- ✅ Token é validado em cada requisição protegida
- ✅ Resposta clara se token inválido/expirado

---

Pronto! Sua API agora está segura com autenticação JWT! 🎉
