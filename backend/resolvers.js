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
      const [rows] = await db.query(`
        SELECT p.*, c.nombre as categoria_nombre, c.descripcion 
        FROM producto p 
        LEFT JOIN categoria c ON p.id_categoria = c.id_categoria
      `);
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

    // Actualizar producto
    async actualizarProducto(_, { id_producto, nombre, precio, imagen, id_categoria }) {
      const updates = [];
      const values = [];
    
      if (nombre !== undefined) {
        updates.push("nombre = ?");
        values.push(nombre);
      }
      if (precio !== undefined) {
        updates.push("precio = ?");
        values.push(precio);
      }
      if (imagen !== undefined) {
        updates.push("imagen = ?");
        values.push(imagen);
      }
      if (id_categoria !== undefined) {
        updates.push("id_categoria = ?");
        values.push(id_categoria);
      }
      
      if (updates.length === 0) {
        throw new Error("No se proporcionaron campos para actualizar");
      }
      
      values.push(id_producto);
      
      const [result] = await db.query(
        `UPDATE producto SET ${updates.join(", ")} WHERE id_producto = ?`,
        values
      );
      
      if (result.affectedRows === 0) {
        throw new Error("Producto no encontrado");
      }
      
      // Devolver el producto actualizado
      const [rows] = await db.query(
        "SELECT * FROM producto WHERE id_producto = ?",
        [id_producto]
      );
      
      return rows[0];
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
