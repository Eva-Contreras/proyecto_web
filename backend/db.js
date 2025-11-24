// ARCHIVO ENCARGADO DE CONECTARSE A POSTGRESQL

import pkg from 'pg';
const { Pool } = pkg;
import dotenv from 'dotenv';

// Carga variables del archivo .env
dotenv.config();

// Crear un pool de conexiones
export const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false
  }
});

// Exportamos la conexión para usarla en otros archivos
export default pool;