import pkg from 'pg';
const { Pool } = pkg;

const BD = new Pool({
    user: 'postgres',
    host: 'localhost',
    password: 'admin',
    database: 'db_agro_finan', 
    port: 5432
});

const testarConexao = async () => {
    try {
        const cliente = await BD.connect(); 
        cliente.release(); 
    } catch (error) {
        throw new Error(error.message);
    }
};

export { BD, testarConexao };