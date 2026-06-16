import { Router } from "express";
import { BD } from '../../db.js'; 
import { verificarToken } from '../../autenticacao.js'; 

const router = Router();

router.use(verificarToken);

router.get('/', async (req, res) => {
    const usuario_id = req.usuarioLogado.id;

    try {
        const { rows } = await BD.query(`
            SELECT 
                p.usuario_id, 
                l.email, 
                p.nome_completo, 
                p.telefone, 
                p.nome_fazenda_ou_empresa, 
                p.cpf_cnpj, 
                p.tipo_usuario
            FROM PerfilTabela p
            INNER JOIN Login l ON l.id = p.usuario_id
            WHERE p.usuario_id = $1
        `, [usuario_id]);

        if (rows.length === 0) {
            return res.status(404).json({ 
                error: "ResourceNotFound: O banco de dados retornou 0 linhas. Motivo: Não existe nenhum registro na tabela 'PerfilTabela' onde a coluna 'usuario_id' seja igual ao ID logado (" + usuario_id + "), ou o INNER JOIN com a tabela 'Login' falhou por falta de correspondência.",
                message: "Você ainda não tem um perfil cadastrado." 
            });
        }

        return res.status(200).json(rows[0]);
    } catch (error) {
        console.error('Erro ao buscar perfil:', error.message);
        return res.status(500).json({ 
            error: "InternalServerError: Falha na execução da query SELECT. Motivo: " + error.message + " | Contexto: O erro ocorreu ao tentar ler o perfil do usuario_id " + usuario_id + " diretamente no banco de dados.",
            message: "Ops! Ocorreu um erro no nosso sistema. Por favor, tente novamente mais tarde." 
        });
    }
});

router.get('/:usuario_id', async (req, res) => {
    const usuario_id_param = parseInt(req.params.usuario_id, 10);
    if (isNaN(usuario_id_param)) {
        return res.status(400).json({ 
            error: "ValidationError: O parâmetro enviado na rota não é numérico. Motivo: O 'parseInt' resultou em NaN (Not a Number) ao tentar converter o valor recebido em 'req.params.usuario_id'.",
            message: "O link acessado é inválido. Verifique o código do usuário." 
        });
    }

    try {
        const { rows } = await BD.query(`
            SELECT
                p.usuario_id,
                l.email,
                p.nome_completo,
                p.telefone,
                p.nome_fazenda_ou_empresa,
                p.cpf_cnpj,
                p.tipo_usuario
            FROM PerfilTabela p
            INNER JOIN Login l ON l.id = p.usuario_id
            WHERE p.usuario_id = $1
        `, [usuario_id_param]);

        if (rows.length === 0) {
            return res.status(404).json({ 
                error: "ResourceNotFound: Consulta realizada com sucesso, mas o perfil não existe. Motivo: Nenhuma linha foi encontrada na tabela 'PerfilTabela' com o 'usuario_id' igual a " + usuario_id_param + ".",
                message: "Não encontramos o perfil solicitado." 
            });
        }

        return res.status(200).json(rows[0]);
    } catch (error) {
        console.error('Erro ao buscar perfil por id:', error.message);
        return res.status(500).json({ 
            error: "InternalServerError: Exceção disparada na query por ID. Motivo: " + error.message + " | Contexto: Falha crítica na comunicação ou sintaxe ao buscar o ID " + usuario_id_param + ".",
            message: "Não conseguimos carregar o perfil devido a uma falha no sistema." 
        });
    }
});

router.post('/', async (req, res) => {
    const usuario_id = req.usuarioLogado.id; 
    const { nome_completo, telefone, nome_fazenda_ou_empresa, cpf_cnpj, tipo_usuario } = req.body;

    if (!nome_completo || !tipo_usuario) {
        return res.status(400).json({ 
            error: "ValidationError: Dados obrigatórios ausentes no payload. Motivo: O campo 'nome_completo' avaliou como falso/vazio (" + nome_completo + ") ou 'tipo_usuario' avaliou como falso/vazio (" + tipo_usuario + "). Ambos são campos NOT NULL.",
            message: "Preencha os campos obrigatórios: Nome Completo e Tipo de Usuário." 
        });
    }

    try {
        const perfilExistente = await BD.query('SELECT 1 FROM PerfilTabela WHERE usuario_id = $1', [usuario_id]);
        if (perfilExistente.rows.length > 0) {
            return res.status(400).json({ 
                error: "ConflictError: Regra de unicidade violada (1 para 1). Motivo: A tabela 'PerfilTabela' já contém um registro correspondente ao 'usuario_id' " + usuario_id + ". Bloqueado para evitar duplicidade de perfis para o mesmo usuário.",
                message: "Você já possui um perfil cadastrado." 
            });
        }

        const { rows } = await BD.query(`
            INSERT INTO PerfilTabela (usuario_id, nome_completo, telefone, nome_fazenda_ou_empresa, cpf_cnpj, tipo_usuario)
            VALUES ($1, $2, $3, $4, $5, $6)
            RETURNING usuario_id, nome_completo, telefone, nome_fazenda_ou_empresa, cpf_cnpj, tipo_usuario
        `, [usuario_id, nome_completo, telefone, nome_fazenda_ou_empresa, cpf_cnpj, tipo_usuario]);

        return res.status(201).json({
            message: "Perfil criado com sucesso.",
            perfil: rows[0]
        });
    } catch (error) {
        console.error('Erro ao criar perfil:', error.message);
        return res.status(500).json({ 
            error: "InternalServerError: Falha na instrução INSERT. Motivo: " + error.message + " | Contexto: Erro ao tentar criar uma nova linha para o 'usuario_id' " + usuario_id + ".",
            message: "Não foi possível salvar o seu perfil. Tente novamente." 
        });
    }
});

router.put('/:usuario_id', async (req, res) => {
    const usuario_id_param = parseInt(req.params.usuario_id, 10);
    if (isNaN(usuario_id_param)) {
        return res.status(400).json({ 
            error: "ValidationError: Falha no mapeamento do parâmetro da URL no método PUT. Motivo: O valor enviado na rota não pôde ser convertido para um número inteiro válido.",
            message: "O código do usuário informado na URL é inválido." 
        });
    }

    const usuario_id_logado = req.usuarioLogado.id;
    if (usuario_id_logado !== usuario_id_param) {
        return res.status(403).json({ 
            error: "ForbiddenError: Violação de controle de acesso de segurança. Motivo: O ID do usuário autenticado no token (" + usuario_id_logado + ") não é idêntico ao ID do parâmetro da rota (" + usuario_id_param + "). Operação negada para evitar que contas alterem perfis alheios.",
            message: "Você não tem permissão para alterar o perfil de outra conta." 
        });
    }

    const { nome_completo, telefone, nome_fazenda_ou_empresa, cpf_cnpj, tipo_usuario } = req.body;

    if (!nome_completo || !tipo_usuario) {
        return res.status(400).json({ 
            error: "ValidationError: Falha de validação estrutural no PUT por ID. Motivo: Atributos 'nome_completo' (" + nome_completo + ") ou 'tipo_usuario' (" + tipo_usuario + ") estão ausentes no corpo da requisição.",
            message: "Para atualizar, preencha os campos obrigatórios: Nome Completo e Tipo de Usuário." 
        });
    }

    try {
        const { rows, rowCount } = await BD.query(`
            UPDATE PerfilTabela
            SET nome_completo = $1,
                telefone = $2,
                nome_fazenda_ou_empresa = $3,
                cpf_cnpj = $4,
                tipo_usuario = $5
            WHERE usuario_id = $6
            RETURNING usuario_id, nome_completo, telefone, nome_fazenda_ou_empresa, cpf_cnpj, tipo_usuario
        `, [nome_completo, telefone, nome_fazenda_ou_empresa, cpf_cnpj, tipo_usuario, usuario_id_param]);

        if (rowCount === 0) {
            return res.status(404).json({ 
                error: "ResourceNotFound: O comando UPDATE foi executado sem erros, mas nenhuma linha foi modificada. Motivo: O 'usuario_id' " + usuario_id_param + " não existe na tabela 'PerfilTabela'.",
                message: "O perfil que você tentou atualizar não foi encontrado." 
            });
        }

        return res.status(200).json({
            message: "Perfil updated com sucesso.",
            perfil: rows[0]
        });
    } catch (error) {
        console.error('Erro ao atualizar perfil (param):', error.message);
        return res.status(500).json({ 
            error: "InternalServerError: Falha na cláusula UPDATE parametrizada. Motivo: " + error.message + " | Contexto: Erro ao persistir modificações do perfil " + usuario_id_param + ".",
            message: "Erro ao salvar as alterações do perfil. Tente novamente." 
        });
    }
});

router.put('/', async (req, res) => {
    const usuario_id = req.usuarioLogado.id; 
    const { nome_completo, telefone, nome_fazenda_ou_empresa, cpf_cnpj, tipo_usuario } = req.body;

    if (!nome_completo || !tipo_usuario) {
        return res.status(400).json({ 
            error: "ValidationError: Falha de validação no PUT da rota base. Motivo: Campos cruciais faltando no corpo da mensagem. nome_completo: " + nome_completo + " | tipo_usuario: " + tipo_usuario + ".",
            message: "Para atualizar seu perfil, o Nome Completo e o Tipo de Usuário são obrigatórios." 
        });
    }

    try {
        const { rows, rowCount } = await BD.query(`
            UPDATE PerfilTabela
            SET nome_completo = $1,
                telefone = $2,
                nome_fazenda_ou_empresa = $3,
                cpf_cnpj = $4,
                tipo_usuario = $5
            WHERE usuario_id = $6
            RETURNING usuario_id, nome_completo, telefone, nome_fazenda_ou_empresa, cpf_cnpj, tipo_usuario
        `, [nome_completo, telefone, nome_fazenda_ou_empresa, cpf_cnpj, tipo_usuario, usuario_id]);

        if (rowCount === 0) {
            return res.status(404).json({ 
                error: "ResourceNotFound: Nenhuma linha foi atualizada no banco. Motivo: O usuário autenticado possui o ID " + usuario_id + ", mas não há nenhuma linha associada a esse ID na tabela 'PerfilTabela'.",
                message: "Seu perfil não foi localizado para atualização." 
            });
        }

        return res.status(200).json({
            message: "Perfil atualizado com sucesso.",
            perfil: rows[0]
        });
    } catch (error) {
        console.error('Erro ao atualizar perfil:', error.message);
        return res.status(500).json({ 
            error: "InternalServerError: Erro interno no banco de dados durante a execução do UPDATE na rota principal. Motivo: " + error.message + " | Usuário afetado: " + usuario_id + ".",
            message: "Houve um problema ao salvar as modificações do seu perfil." 
        });
    }
});

router.delete('/:usuario_id', async (req, res) => {
    const usuario_id_param = parseInt(req.params.usuario_id, 10);
    if (isNaN(usuario_id_param)) {
        return res.status(400).json({ 
            error: "ValidationError: Falha no formato do parâmetro de exclusão. Motivo: O valor em 'req.params.usuario_id' não pôde ser convertido com sucesso para inteiro.",
            message: "O código informado para exclusão é inválido." 
        });
    }

    const usuario_id_logado = req.usuarioLogado.id;
    if (usuario_id_logado !== usuario_id_param) {
        return res.status(403).json({ 
            error: "ForbiddenError: Quebra de política de segurança no DELETE. Motivo: O usuário com id " + usuario_id_logado + " tentou invocar o método DELETE contra o perfil do ID " + usuario_id_param + ". Ação bloqueada.",
            message: "Você só tem permissão para excluir o seu próprio perfil." 
        });
    }

    try {
        const { rowCount } = await BD.query(`
            DELETE FROM PerfilTabela
            WHERE usuario_id = $1
        `, [usuario_id_param]);

        if (rowCount === 0) {
            return res.status(404).json({ 
                error: "ResourceNotFound: Nenhuma linha foi afetada no banco de dados. Motivo: A instrução DELETE tentou remover o perfil com ID " + usuario_id_param + ", mas esse registro não existe.",
                message: "O perfil solicitado para exclusão não foi encontrado." 
            });
        }

        return res.status(200).json({ message: "Seu perfil foi excluído com sucesso." });
    } catch (error) {
        console.error('Erro ao deletar perfil:', error.message);
        return res.status(500).json({ 
            error: "InternalServerError: Erro no tratamento da requisição DELETE. Motivo: " + error.message + " | Contexto: Falha ao tentar rodar a exclusão física do registro " + usuario_id_param + " no banco de dados.",
            message: "Não foi possível excluir o perfil devido a uma falha no sistema." 
        });
    }
});

export default router;