// IMPORTACIÓN DE LIBRERIAS

import express from 'express'; // Servidor web que maneja rutas HTTP
import cors from 'cors'; // Permite que el frontend pueda hacer peticiones desde otro dominio.
import bodyParser from 'body-parser'; // Interpreta JSON en las solicitudes HTTP
import dotenv from 'dotenv'; // Lee las variables de .env

// Apollo Server: Permiten montar GraphQL sobre Express
import { ApolloServer } from "apollo-server-express"; 

// Importar schema y resolvers: queries y mutaciones de GraphQL
import typeDefs from './schema.js'; // GraphQL schema
import resolvers from './resolvers.js'; // GraphQL resolvers

// Leer variables de entorno
dotenv.config();

// CREACIÓN DE FUNCIÓN PARA INICIAR EL SERVIDOR

async function startServer() {
    const app = express(); // Inicializa Express
    const port = process.env.PORT || 4000; // Puerto del servidor

    // Crear servidor Apollo con schema y resolvers
    const server = new ApolloServer({
        typeDefs,
        resolvers,
    });

    // Iniciar Apollo Server
    await server.start(); // Inicia Apollo Server antes de usarlo como middleware

    // Configurar middleware
    app.use(cors()); // Habilitar CORS
    app.use(bodyParser.json()); // Habilitar body-parser para JSON
    server.applyMiddleware({ app, path: '/graphql'}) // Montar Apollo Server en /graphql

    // Ruta de prueba para verificar que el backend funciona
    app.get('/', (req, res) => {
        res.send('¡El servidor funciona correctamente!');
    });

    // Iniciar Express
    app.listen(port, () => {
    console.log(`Servidor listo en http://localhost:${port}${server.graphqlPath}`);
});
}

// Ejecutar la función
startServer();