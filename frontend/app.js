// CONFIGURACIÓN - URL de tu backend en Render.com
const API_URL = 'https://proyecto-web-backend-kwrj.onrender.com/graphql';

// Variables globales
let productosGlobal = [];
let categoriaActual = 'todo';

// Función principal al cargar la página
document.addEventListener('DOMContentLoaded', function() {
    cargarProductosDesdeBackend();
    configurarEventListeners();
});

// Configurar event listeners
function configurarEventListeners() {
    const categoryButtons = document.querySelectorAll('.btn-category');
    
    categoryButtons.forEach(button => {
        button.addEventListener('click', function() {
            // Actualizar botones activos
            categoryButtons.forEach(btn => btn.classList.remove('active-category'));
            this.classList.add('active-category');
            
            // Cambiar categoría
            categoriaActual = this.dataset.category;
            renderizarProductos();
        });
    });
}

// Cargar productos desde tu backend GraphQL
async function cargarProductosDesdeBackend() {
    try {
        mostrarLoading(true);
        
        const query = `
            query {
                productos {
                    id_producto
                    nombre
                    precio
                    imagen
                    categoria {
                        nombre
                    }
                }
            }
        `;
        
        const response = await fetch(API_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ query })
        });
        
        const data = await response.json();
        
        if (data.errors) {
            throw new Error(data.errors[0].message);
        }
        
        productosGlobal = data.data.productos;
        renderizarProductos();
        renderizarProductosAdmin();
        
    } catch (error) {
        console.error('Error cargando productos:', error);
        mostrarError('Error al cargar productos: ' + error.message);
    } finally {
        mostrarLoading(false);
    }
}

// Renderizar productos en el menú
function renderizarProductos() {
    const container = document.getElementById('products-container');
    
    let productosFiltrados = productosGlobal;
    
    if (categoriaActual !== 'todo') {
        productosFiltrados = productosGlobal.filter(
            producto => producto.categoria.nombre === categoriaActual
        );
    }
    
    if (productosFiltrados.length === 0) {
        container.innerHTML = `
            <div class="col-12 text-center py-5">
                <i class="fa-solid fa-utensils fs-1 text-muted mb-3"></i>
                <p class="text-muted">No hay productos en esta categoría</p>
            </div>
        `;
        return;
    }
    
    const html = productosFiltrados.map(producto => `
        <div class="col product-card-col">
            <div class="card h-100">
                <img src="imagenes/${producto.imagen || 'placeholder.jpg'}" 
                     class="card-img-top product-image" 
                     alt="${producto.nombre}"
                     onerror="this.src='https://via.placeholder.com/250x150/FF6B6B/FFFFFF?text=Imagen+No+Disponible'">
                <div class="card-body text-center">
                    <h5 class="card-title">${producto.nombre}</h5>
                    <p class="card-text text-muted small">${producto.categoria.nombre}</p>
                    <p class="price">$${producto.precio}</p>
                </div>
            </div>
        </div>
    `).join('');
    
    container.innerHTML = html;
    
    // Actualizar título
    const titulos = {
        'todo': 'Todo el Menú',
        'Comidas': 'Platillos y Comida', 
        'Bebidas': 'Bebidas y Refrescos',
        'Complementos': 'Complementos y Extras',
        'Postres': 'Postres y Dulces'
    };
    document.getElementById('content-title').textContent = titulos[categoriaActual] || 'Menú';
}

// Renderizar productos en panel de administración
function renderizarProductosAdmin() {
    const container = document.getElementById('admin-container');
    
    const html = productosGlobal.map(producto => `
        <div class="col">
            <div class="card admin-card h-100" onclick="abrirModalEditar(${producto.id_producto})">
                <div class="card-body">
                    <div class="d-flex justify-content-between align-items-start">
                        <div>
                            <h5 class="card-title">${producto.nombre}</h5>
                            <p class="card-text text-muted">${producto.categoria.nombre}</p>
                            <p class="price">$${producto.precio}</p>
                        </div>
                        <span class="badge bg-secondary">ID: ${producto.id_producto}</span>
                    </div>
                    <small class="text-muted">Click para editar precio</small>
                </div>
            </div>
        </div>
    `).join('');
    
    container.innerHTML = html;
}

// Funciones para cambiar entre menú y administración
function mostrarAdmin() {
    document.getElementById('menu-section').classList.add('d-none');
    document.getElementById('admin-section').classList.remove('d-none');
}

function mostrarMenu() {
    document.getElementById('admin-section').classList.add('d-none');
    document.getElementById('menu-section').classList.remove('d-none');
}

// Modal de edición
function abrirModalEditar(idProducto) {
    const producto = productosGlobal.find(p => p.id_producto == idProducto);
    
    if (!producto) return;
    
    document.getElementById('edit-id').value = producto.id_producto;
    document.getElementById('edit-nombre').value = producto.nombre;
    document.getElementById('edit-categoria').value = producto.categoria.nombre;
    document.getElementById('edit-precio').value = producto.precio;
    
    const modal = new bootstrap.Modal(document.getElementById('editarModal'));
    modal.show();
}

// Guardar cambios en el producto
async function guardarCambios() {
    const id = document.getElementById('edit-id').value;
    const nuevoPrecio = parseFloat(document.getElementById('edit-precio').value);
    
    if (!nuevoPrecio || nuevoPrecio < 0) {
        alert('Por favor ingresa un precio válido');
        return;
    }
    
    try {
        const mutation = `
            mutation {
                actualizarProducto(
                    id_producto: ${id}
                    precio: ${nuevoPrecio}
                ) {
                    id_producto
                    nombre
                    precio
                }
            }
        `;
        
        const response = await fetch(API_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ query: mutation })
        });
        
        const data = await response.json();
        
        if (data.errors) {
            throw new Error(data.errors[0].message);
        }
        
        // Cerrar modal
        const modal = bootstrap.Modal.getInstance(document.getElementById('editarModal'));
        modal.hide();
        
        // Recargar productos
        await cargarProductosDesdeBackend();
        
        mostrarExito('✅ Precio actualizado correctamente');
        
    } catch (error) {
        console.error('Error actualizando producto:', error);
        mostrarError('Error al actualizar: ' + error.message);
    }
}

// Utilidades
function mostrarLoading(mostrar) {
    // Implementar spinner de carga si quieres
}

function mostrarError(mensaje) {
    alert('Error: ' + mensaje);
}

function mostrarExito(mensaje) {
    // Podrías implementar notificaciones bonitas aquí
    alert(mensaje);
}