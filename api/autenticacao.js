import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';

dotenv.config();

const JWT_SECRET = process.env.JWT_SECRET || 'sua_chave_secreta_padrao';

export function verificarToken(req, res, next) {
    const authHeader = req.headers['authorization'];
    
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
        return res.status(401).json({ message: 'Acesso negado. Token não fornecido.' });
    }

    try {
        const dadosDecodificados = jwt.verify(token, JWT_SECRET);
        
        req.usuarioLogado = dadosDecodificados;
        
        next(); 
    } catch (erro) {
        return res.status(403).json({ message: 'Token inválido ou expirado.' });
    }
}