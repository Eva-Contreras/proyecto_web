// ACTIVACIÓN DE OPERACIONES DE GRAPHQL

import db from "./db.js";

const resolvers = {

  // queries
  Query: {
    // Obtener todas las categorías
    async categorias() {
      const [rows] = await db.query("SELECT * FROM categoria");
      return rows;
    },

    // Obtener todos los productos
    async productos() {
      const [rows] = await db.query("SELECT * FROM producto");
      return rows;
    },

    // Obtener un producto específico
    async producto(_, { id_producto }) {
      const [rows] = await db.query(
        "SELECT * FROM producto WHERE id_producto = ?",
        [id_producto]
      );
      return rows[0] || null;
    },
  },

  // Relación categoría - producto
  Producto: {
    // Resolver la categoría de cada producto
    async categoria(parent) {
      const [rows] = await db.query(
        "SELECT * FROM categoria WHERE id_categoria = ?",
        [parent.id_categoria]
      );
      return rows[0] || null;
    },
  },
  
  // mutaciones
  Mutation: {
    // Agregar una nueva categoría
    async agregarCategoria(_, { nombre }) {
      const [result] = await db.query(
        "INSERT INTO categoria (nombre) VALUES (?)",
        [nombre]
      );

      return {
        id_categoria: result.insertId,
        nombre,
      };
    },

    // Agregar un nuevo producto
    async agregarProducto(_, { nombre, precio, imagen, id_categoria }) {
      const [result] = await db.query(
        "INSERT INTO producto (nombre, precio, imagen, id_categoria) VALUES (?, ?, ?, ?)",
        [nombre, precio, imagen, id_categoria]
      );

      return {
        id_producto: result.insertId,
        nombre,
        precio,
        imagen,
        id_categoria,
      };
    },

    // Eliminar un producto
    async eliminarProducto(_, { id_producto }) {
      const [result] = await db.query(
        "DELETE FROM producto WHERE id_producto = ?",
        [id_producto]
      );

      return result.affectedRows > 0;
    },
  },
};

export default resolvers;
