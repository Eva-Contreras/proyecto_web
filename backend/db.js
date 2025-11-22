// ARCHIVO ENCARGADO DE CONECTARSE A MYSQL

import mysql from 'mysql2/promise';
import dotenv from 'dotenv';

// Carga variables del archivo .env
dotenv.config();

// Crear un pool de conexiones
export const db = mysql.createPool({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    port: process.env.DB_PORT,
    ssl: { rejectUnauthorized: false }, // Para conexiones seguras en Railway
});

// Exportamos la conexión para usarla en otros archivos
export default db;