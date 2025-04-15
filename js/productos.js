document.addEventListener('DOMContentLoaded', () => {
    const listaProductos = document.getElementById('lista-productos');
    const btnNuevoProducto = document.getElementById('btn-nuevo-producto');
    const modal = document.getElementById('modal-producto');
    const formProducto = document.getElementById('form-producto');
    const inputBusqueda = document.getElementById('buscar-producto');
    const btnBuscar = document.getElementById('btn-buscar');
    
    let productos = [];
    let productoActualId = null;

    cargarProductos();
    configurarEventos();

    // Funciones
    async function cargarProductos() {
        try {
            productos = [
                {
                    id: 1,
                    nombre: 'Tubo PVC 20mm',
                    precio: 3.50,
                    stock: 100,
                    descripcion: 'Tubo de PVC de 20mm de diámetro para instalaciones de agua',
                    imagen: 'img/productos/tuboPvc.png'
                },
                {
                    id: 2,
                    nombre: 'Grifo de cocina',
                    precio: 45.90,
                    stock: 30,
                    descripcion: 'Grifo de cocina monomando con filtro incorporado',
                    imagen: 'img/productos/grifo.png'
                },
                {
                    id: 3,
                    nombre: 'Válvula de presión',
                    precio: 12.75,
                    stock: 0,
                    descripcion: 'Válvula reguladora de presión para sistemas de agua',
                    imagen: 'img/productos/valvula.png'
                },
                {
                    id: 4,
                    nombre: 'Grifo de ducha',
                    precio: 35.75,
                    stock: 8,
                    descripcion: 'Grifo de ducha con boquilla universal',
                    imagen: 'img/productos/grifoDucha.png'
                }
            ];
            
            renderizarProductos();
        } catch (error) {
            console.error('Error al cargar productos:', error);
            mostrarAlerta('Error al cargar productos', 'error');
        }
    }

    function configurarEventos() {
        btnNuevoProducto.addEventListener('click', abrirModalNuevoProducto);
        document.querySelectorAll('.cerrar-modal').forEach(btn => {
            btn.addEventListener('click', cerrarModal);
        });
        formProducto.addEventListener('submit', manejarSubmitProducto);
        btnBuscar.addEventListener('click', filtrarProductos);
        inputBusqueda.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') filtrarProductos();
        });
        document.getElementById('modal-imagen').addEventListener('change', mostrarVistaPrevia);
    }

    function abrirModalNuevoProducto() {
        modoEdicion = false;
        productoActualId = null;
        document.getElementById('titulo-modal-producto').textContent = 'Nuevo Producto';
        formProducto.reset();
        document.getElementById('vista-previa-imagen').innerHTML = '';
        abrirModal();
    }

    function abrirModal() {
        modal.style.display = 'block';
    }

    function cerrarModal() {
        modal.style.display = 'none';
    }

    function renderizarProductos() {
        listaProductos.innerHTML = productos.map(producto => `
            <div class="tarjeta-producto" data-id="${producto.id}">
                <div class="imagen-contenedor">
                    <img src="${producto.imagen || 'img/productos/default.png'}" alt="${producto.nombre}" class="imagen-producto">
                </div>
                <div class="cuerpo-producto">
                    <h3>${producto.nombre}</h3>
                    <span class="badge-stock ${producto.stock > 0 ? 'stock-disponible' : 'stock-agotado'}">
                        ${producto.stock > 0 ? `${producto.stock} disponibles` : 'Agotado'}
                    </span>
                    <p class="precio-producto">${producto.precio.toFixed(2)} €</p>
                    <p class="descripcion-producto">${producto.descripcion || 'Sin descripción'}</p>
                    <div class="acciones-producto">
                        <button class="btn-accion btn-editar" data-id="${producto.id}">Editar</button>
                        <button class="btn-accion btn-eliminar" data-id="${producto.id}">Eliminar</button>
                    </div>
                </div>
            </div>
        `).join('');

        document.querySelectorAll('.btn-editar').forEach(btn => {
            btn.addEventListener('click', cargarProductoParaEditar);
        });

        document.querySelectorAll('.btn-eliminar').forEach(btn => {
            btn.addEventListener('click', confirmarEliminarProducto);
        });
    }

    function cargarProductoParaEditar(e) {
        const id = parseInt(e.target.getAttribute('data-id'));
        const producto = productos.find(p => p.id === id);
        
        if (producto) {
            document.getElementById('titulo-modal-producto').textContent = 'Editar Producto';
            document.getElementById('producto-id').value = producto.id;
            document.getElementById('modal-nombre').value = producto.nombre;
            document.getElementById('modal-precio').value = producto.precio;
            document.getElementById('modal-stock').value = producto.stock;
            document.getElementById('modal-descripcion').value = producto.descripcion || '';
            
            if (producto.imagen) {
                document.getElementById('vista-previa-imagen').innerHTML = `
                    <img src="${producto.imagen}" alt="Vista previa" style="max-width: 100px; margin-top: 10px;">
                `;
            }
            
            abrirModal();
        }
    }

    function confirmarEliminarProducto(e) {
        const id = parseInt(e.target.getAttribute('data-id'));
        if (confirm('¿Estás seguro de eliminar este producto?')) {
            productos = productos.filter(p => p.id !== id);
            renderizarProductos();
            mostrarAlerta('Producto eliminado correctamente', 'success');
        }
    }

    function manejarSubmitProducto(e) {
        e.preventDefault();
        
        const formData = {
            nombre: document.getElementById('modal-nombre').value,
            precio: parseFloat(document.getElementById('modal-precio').value),
            stock: parseInt(document.getElementById('modal-stock').value),
            descripcion: document.getElementById('modal-descripcion').value,
            imagen: 'img/productos/default.png' 
        };

        try {
            const id = document.getElementById('producto-id').value;
            if (id) {
                const index = productos.findIndex(p => p.id === parseInt(id));
                if (index !== -1) {
                    productos[index] = { ...productos[index], ...formData };
                }
                mostrarAlerta('Producto actualizado correctamente', 'success');
            } else {
                const nuevoId = Math.max(...productos.map(p => p.id), 0) + 1;
                const nuevoProducto = { ...formData, id: nuevoId };
                productos.push(nuevoProducto);
                mostrarAlerta('Producto creado correctamente', 'success');
            }
            
            renderizarProductos();
            cerrarModal();
        } catch (error) {
            console.error('Error al guardar:', error);
            mostrarAlerta('Error al guardar producto', 'error');
        }
    }

    function mostrarVistaPrevia(e) {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = function(event) {
                document.getElementById('vista-previa-imagen').innerHTML = `
                    <img src="${event.target.result}" alt="Vista previa" style="max-width: 100px; margin-top: 10px;">
                `;
            };
            reader.readAsDataURL(file);
        }
    }

    function filtrarProductos() {
        const termino = inputBusqueda.value.toLowerCase().trim();
        const tarjetas = document.querySelectorAll('.tarjeta-producto');
        
        tarjetas.forEach(tarjeta => {
            const nombre = tarjeta.querySelector('h3').textContent.toLowerCase();
            if (termino === '' || nombre.includes(termino)) {
                tarjeta.style.display = '';
            } else {
                tarjeta.style.display = 'none';
            }
        });
    }

    function mostrarAlerta(mensaje, tipo) {
        const alerta = document.createElement('div');
        alerta.className = `alerta alerta-${tipo}`;
        alerta.textContent = mensaje;
        document.body.appendChild(alerta);
        
        setTimeout(() => {
            alerta.remove();
        }, 3000);
    }
});