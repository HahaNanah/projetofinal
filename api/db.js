import pkg from 'pg';
const { Pool } = pkg;

const BD = new Pool({
  connectionString: "postgresql://postgres.zealpzdccmirmqkyfmsz:Thiciane12345@aws-1-us-east-1.pooler.supabase.com:6543/postgres?pgbouncer=true",
  ssl: {
    rejectUnauthorized: false
  }
});

const testarConexao = async () => {
  try {
    const cliente = await BD.connect();
    console.log("Conectado ao banco com sucesso!");
    cliente.release();
  } catch (error) {
    console.error(" Erro ao conectar no banco:", error.message);
    throw new Error(error.message);
  }
};

export { BD, testarConexao };