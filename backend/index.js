// IMPORTACIÓN DE LIBRERIAS

import express from 'express'; // Servidor web que maneja rutas HTTP
import cors from 'cors'; // Permite que el frontend pueda hacer peticiones desde otro dominio.
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
    const port = process.env.PORT || 8080; // Railway usa PORT automáticamente
    
    // Obtener el dominio de Railway si existe
    const railwayDomain = process.env.RAILWAY_PUBLIC_DOMAIN 
        ? `https://${process.env.RAILWAY_PUBLIC_DOMAIN}` 
        : `http://localhost:${port}`;

    // Crear servidor Apollo con schema y resolvers
    const server = new ApolloServer({
        typeDefs,
        resolvers,
        introspection: true, // Permite introspección en producción
        playground: true, // Habilita GraphQL Playground
        csrfPrevention: true, // Seguridad adicional
        cache: 'bounded', // Soluciona el warning de tu log
        formatError: (error) => {
            console.error('GraphQL Error:', error);
            return error;
        },
    });

    // Iniciar Apollo Server
    await server.start(); // Inicia Apollo Server antes de usarlo como middleware

    // Configurar CORS dinámicamente según el entorno
    const allowedOrigins = [
        'http://localhost:3000',
        'http://localhost:4000',
        'https://studio.apollographql.com',
    ];

    // Si hay dominio de Railway, agregarlo a los orígenes permitidos
    if (process.env.RAILWAY_PUBLIC_DOMAIN) {
        allowedOrigins.push(`https://${process.env.RAILWAY_PUBLIC_DOMAIN}`);
    }

    app.use(cors({
        origin: allowedOrigins,
        credentials: true
    }));
    
    app.use(express.json());
    app.use(express.urlencoded({ extended: true }));
    server.applyMiddleware({ app, path: '/graphql' }); // Montar Apollo Server en /graphql

    // Ruta de prueba para verificar que el backend funciona
    app.get('/', (req, res) => {
        res.send('¡El servidor funciona correctamente!');
    });

    // Health check para Railway
    app.get('/health', (req, res) => {
        res.status(200).json({ status: 'ok', timestamp: new Date().toISOString() });
    });

    // Iniciar Express en 0.0.0.0 para que Railway pueda acceder
    app.listen(port, '0.0.0.0', () => {
        console.log(`🚀 Servidor listo en ${railwayDomain}${server.graphqlPath}`);
        console.log(`📍 Health check disponible en ${railwayDomain}/health`);
    });
}

// Manejo de errores no capturados
process.on('unhandledRejection', (error) => {
    console.error('Unhandled Rejection:', error);
});

// Ejecutar la función
startServer();