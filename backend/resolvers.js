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
      const result = await db.query(`
        SELECT p.*, c.nombre as categoria_nombre, c.descripcion 
        FROM producto p 
        LEFT JOIN categoria c ON p.id_categoria = c.id_categoria
      `);
      return result.rows;
    },

    // Obtener un producto específico
    async producto(_, { id_producto }) {
      const result = await db.query(
        "SELECT * FROM producto WHERE id_producto = $1",
        [id_producto]
      );
      return result.rows[0] || null;
    },
  },

  // Relación categoría - producto
  Producto: {
    // Resolver la categoría de cada producto
    async categoria(parent) {
      const result = await db.query(
        "SELECT * FROM categoria WHERE id_categoria = $1",
        [parent.id_categoria]
      );
      return result.rows[0] || null;
    },
  },
  
  // mutaciones
  Mutation: {
    // Agregar una nueva categoría
    async agregarCategoria(_, { nombre }) {
      const result = await db.query(
        "INSERT INTO categoria (nombre) VALUES ($1) RETURNING *",
        [nombre]
      );
      return result.rows[0];
    },


    // Agregar un nuevo producto
    async agregarProducto(_, { nombre, precio, imagen, id_categoria }) {
      const result = await db.query(
        "INSERT INTO producto (nombre, precio, imagen, id_categoria) VALUES ($1, $2, $3, $4) RETURNING *",
        [nombre, precio, imagen, id_categoria]
      );
      return result.rows[0];
    },

    // Actualizar producto
    async actualizarProducto(_, { id_producto, nombre, precio, imagen, id_categoria }) {
      const updates = [];
      const values = [];
      let paramCount = 1;
      
      if (nombre !== undefined) {
        updates.push(`nombre = $${paramCount}`);
        values.push(nombre);
        paramCount++;
      }
      if (precio !== undefined) {
        updates.push(`precio = $${paramCount}`);
        values.push(precio);
        paramCount++;
      }
      if (imagen !== undefined) {
        updates.push(`imagen = $${paramCount}`);
        values.push(imagen);
        paramCount++;
      }
      if (id_categoria !== undefined) {
        updates.push(`id_categoria = $${paramCount}`);
        values.push(id_categoria);
        paramCount++;
      }
      
      if (updates.length === 0) {
        throw new Error("No se proporcionaron campos para actualizar");
      }
      
      values.push(id_producto);
      
      const result = await db.query(
        `UPDATE producto SET ${updates.join(", ")} WHERE id_producto = $${paramCount} RETURNING *`,
        values
      );
      
      if (result.rows.length === 0) {
        throw new Error("Producto no encontrado");
      }
      
      return result.rows[0];
    },

    // Eliminar un producto
    async eliminarProducto(_, { id_producto }) {
      const result = await db.query(
        "DELETE FROM producto WHERE id_producto = $1",
        [id_producto]
      );

      return result.rowCount > 0;
    },
  },
};

export default resolvers;
