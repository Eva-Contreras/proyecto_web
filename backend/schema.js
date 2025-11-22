// OPERACIONES DE GRAPHQL

import { gql } from "apollo-server-express";

const typeDefs = gql`
  # Tipo CATEGORIA
  type Categoria {
    id_categoria: ID
    nombre: String
    descripcion: String
  }

  # Tipo PRODUCTO
  type Producto {
    id_producto: ID
    nombre: String
    precio: Float
    imagen: String
    id_categoria: ID!
    categoria: Categoria   # Relación: un producto pertenece a una categoría
  }

  # queries
  type Query {
    categorias: [Categoria]
    productos: [Producto]
    producto(id_producto: ID!): Producto
  }

  # mutaciones
  type Mutation {
    agregarCategoria(nombre: String!): Categoria

    agregarProducto(
      nombre: String!
      precio: Float!
      imagen: String
      id_categoria: ID!
    ): Producto

    actualizarProducto(
      id_producto: ID!
      nombre: String
      precio: Float
      imagen: String
      id_categoria: ID
    ): Producto

    eliminarProducto(id_producto: ID!): Boolean
  }
`;

export default typeDefs;
