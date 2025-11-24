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
    const port = process.env.PORT || 4000; // Render usa PORT automáticamente
    
    // Obtener el dominio de Render (opcional, para logs)
    const renderDomain = process.env.RENDER_EXTERNAL_URL 
        ? process.env.RENDER_EXTERNAL_URL 
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

    // Configuración CORS PERMISIVA para Render
    app.use(cors({
        origin: true,  // ← Permite ANY origen (funciona mejor con GitHub Pages)
        credentials: true,
        methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
        allowedHeaders: ['Content-Type', 'Authorization']
    }));
    
    app.use(express.json());
    app.use(express.urlencoded({ extended: true }));
    server.applyMiddleware({ app, path: '/graphql' }); // Montar Apollo Server en /graphql

    // Ruta de prueba para verificar que el backend funciona
    app.get('/', (req, res) => {
        res.send('¡El servidor funciona correctamente!');
    });

    // Health check para Render (IMPORTANTE)
    app.get('/health', (req, res) => {
        res.status(200).json({ 
            status: 'ok', 
            timestamp: new Date().toISOString(),
            service: 'GraphQL API',
            version: '1.0.0'
        });
    });

    // Iniciar Express en 0.0.0.0 para que Render pueda acceder
    app.listen(port, '0.0.0.0', () => {
        console.log(`🚀 Servidor listo en ${renderDomain}`);
        console.log(`📊 GraphQL disponible en ${renderDomain}/graphql`);
        console.log(`❤️  Health check en ${renderDomain}/health`);
    });
}

// Manejo de errores no capturados
process.on('unhandledRejection', (error) => {
    console.error('Unhandled Rejection:', error);
});

// Manejo de excepciones no capturadas
process.on('uncaughtException', (error) => {
    console.error('Uncaught Exception:', error);
});

// Ejecutar la función
startServer();