document.addEventListener('DOMContentLoaded', () => {
    const tablaServicios = document.getElementById('tabla-servicios');
    const btnNuevoServicio = document.getElementById('btn-nuevo-servicio');
    const modal = document.getElementById('modal-servicio');
    const formServicio = document.getElementById('form-servicio');
    const spanCerrar = document.querySelector('.cerrar-modal');

    let servicios = [];
    let clientes = [];
    let fontaneros = [];
    let productos = [];

    cargarDatosIniciales();
    configurarEventos();

    async function cargarDatosIniciales() {
        try {
            servicios = [
                {
                    id: 1,
                    tipo: 'reparacion',
                    id_cliente: 2,
                    id_fontanero: 1,
                    fecha_solicitud: '2025-01-15',
                    estado: 'completado',
                    productos: [1,3]
                },
                {
                    id: 2,
                    tipo: 'reparacion',
                    id_cliente: 2,
                    id_fontanero: 2,
                    fecha_solicitud: '2025-04-02',
                    estado: 'pendiente',
                    productos: [1]
                },
                {
                    id: 3,
                    tipo: 'instalacion',
                    id_cliente: 1,
                    id_fontanero: 1,
                    fecha_solicitud: '2025-04-06',
                    estado: 'aprobado',
                    productos: [1, 2]
                }
               
            ];

            clientes = [
                { id: 1, nombre: 'Juan Pérez' },
                { id: 2, nombre: 'María García' }
            ];

            fontaneros = [
                { id: 1, nombre: 'Carlos Gómez', especializacion: 'Residencial' },
                { id: 2, nombre: 'Ana López', especializacion: 'Industrial' }
            ];

            productos = [
                { id: 1, nombre: 'Tubo PVC 20mm', stock: 100 },
                { id: 2, nombre: 'Grifo monomando', stock: 30 },
                { id: 3, nombre: 'Válvula de presión', stock: 5 }
            ];

            renderizarTablaServicios();
            poblarSelects();
            renderizarListaProductos();
        } catch (error) {
            console.error('Error al cargar datos:', error);
            mostrarAlerta('Error al cargar datos', 'error');
        }
    }

    function configurarEventos() {
        btnNuevoServicio.addEventListener('click', abrirModalNuevoServicio);
        spanCerrar.addEventListener('click', cerrarModal);
        formServicio.addEventListener('submit', manejarSubmitServicio);
        document.getElementById('filtro-estado').addEventListener('change', filtrarServicios);
    }

    function abrirModalNuevoServicio() {
        document.getElementById('titulo-modal').textContent = 'Nuevo Servicio';
        formServicio.reset();
        abrirModal();
    }

    function abrirModal() {
        modal.style.display = 'block';
    }

    function cerrarModal() {
        modal.style.display = 'none';
    }

    function poblarSelects() {
        const selectCliente = document.getElementById('modal-cliente');
        const selectFontanero = document.getElementById('modal-fontanero');

        selectCliente.innerHTML = clientes.map(cliente =>
            `<option value="${cliente.id}">${cliente.nombre}</option>`
        ).join('');

        selectFontanero.innerHTML = fontaneros.map(fontanero =>
            `<option value="${fontanero.id}">${fontanero.nombre} - ${fontanero.especializacion}</option>`
        ).join('');
    }

    function renderizarListaProductos() {
        const contenedor = document.getElementById('modal-productos');
        contenedor.innerHTML = productos.map(producto => `
            <div class="item-producto">
                <input type="checkbox" id="prod-${producto.id}" data-id="${producto.id}">
                <label for="prod-${producto.id}">${producto.nombre} (Stock: ${producto.stock})</label>
                <input type="number" min="1" max="${producto.stock}" value="1" 
                       data-id="${producto.id}" class="cantidad-producto">
            </div>
        `).join('');
    }

    function renderizarTablaServicios() {
        const tbody = tablaServicios.querySelector('tbody');
        tbody.innerHTML = servicios.map(servicio => {
            const cliente = clientes.find(c => c.id === servicio.id_cliente) || {};
            const fontanero = fontaneros.find(f => f.id === servicio.id_fontanero) || {};

            return `
                <tr>
                    <td>${servicio.id}</td>
                    <td>${servicio.tipo === 'instalacion' ? 'Instalación' : 'Reparación'}</td>
                    <td>${cliente.nombre || 'N/A'}</td>
                    <td>${fontanero.nombre || 'No asignado'}</td>
                    <td>${new Date(servicio.fecha_solicitud).toLocaleDateString()}</td>
                    <td><span class="badge-estado ${servicio.estado}">${capitalizar(servicio.estado)}</span></td>
                    <td class="acciones-tabla">
                        <button class="btn-accion btn-editar" data-id="${servicio.id}">Editar</button>
                        <button class="btn-accion btn-eliminar" data-id="${servicio.id}">Eliminar</button>
                    </td>
                </tr>
            `;
        }).join('');

        document.querySelectorAll('.btn-editar').forEach(btn => {
            btn.addEventListener('click', cargarServicioParaEditar);
        });

        document.querySelectorAll('.btn-eliminar').forEach(btn => {
            btn.addEventListener('click', confirmarEliminarServicio);
        });
    }

    function cargarServicioParaEditar(e) {
        const id = parseInt(e.target.getAttribute('data-id'));
        const servicio = servicios.find(s => s.id === id);

        if (servicio) {
            document.getElementById('titulo-modal').textContent = 'Editar Servicio';
            document.getElementById('servicio-id').value = servicio.id;
            document.getElementById('modal-tipo').value = servicio.tipo;
            document.getElementById('modal-cliente').value = servicio.id_cliente;
            document.getElementById('modal-fontanero').value = servicio.id_fontanero;
            document.getElementById('modal-fecha').value = servicio.fecha_solicitud;
            document.getElementById('modal-estado').value = servicio.estado;

            if (servicio.productos && servicio.productos.length > 0) {
                servicio.productos.forEach(idProducto => {
                    const checkbox = document.querySelector(`#prod-${idProducto}`);
                    if (checkbox) checkbox.checked = true;
                });
            }

            abrirModal();
        }
    }

    function confirmarEliminarServicio(e) {
        const id = parseInt(e.target.getAttribute('data-id'));
        if (confirm('¿Estás seguro de eliminar este servicio?')) {
            servicios = servicios.filter(s => s.id !== id);
            renderizarTablaServicios();
            mostrarAlerta('Servicio eliminado correctamente', 'success');
        }
    }

    function manejarSubmitServicio(e) {
        e.preventDefault();

        const formData = {
            id: document.getElementById('servicio-id').value || null,
            tipo: document.getElementById('modal-tipo').value,
            id_cliente: parseInt(document.getElementById('modal-cliente').value),
            id_fontanero: parseInt(document.getElementById('modal-fontanero').value),
            fecha_solicitud: document.getElementById('modal-fecha').value,
            estado: document.getElementById('modal-estado').value,
            productos: obtenerProductosSeleccionados()
        };

        try {
            if (formData.id) {
                const index = servicios.findIndex(s => s.id === parseInt(formData.id));
                if (index !== -1) {
                    servicios[index] = { ...servicios[index], ...formData };
                }
                mostrarAlerta('Servicio actualizado correctamente', 'success');
            } else {
                const nuevoId = Math.max(...servicios.map(s => s.id), 0) + 1;
                const nuevoServicio = { ...formData, id: nuevoId };
                servicios.push(nuevoServicio);
                mostrarAlerta('Servicio creado correctamente', 'success');
            }

            renderizarTablaServicios();
            cerrarModal();
        } catch (error) {
            console.error('Error al guardar:', error);
            mostrarAlerta('Error al guardar servicio', 'error');
        }
    }

    function obtenerProductosSeleccionados() {
        const productosSeleccionados = [];
        document.querySelectorAll('#modal-productos input[type="checkbox"]:checked').forEach(checkbox => {
            const productoId = parseInt(checkbox.getAttribute('data-id'));
            const cantidad = parseInt(document.querySelector(`.cantidad-producto[data-id="${productoId}"]`).value);
            productosSeleccionados.push(productoId);
        });
        return productosSeleccionados;
    }

    function filtrarServicios() {
        const filtro = document.getElementById('filtro-estado').value;
        const filas = tablaServicios.querySelectorAll('tbody tr');

        filas.forEach(fila => {
            const estado = fila.querySelector('.badge-estado').textContent.toLowerCase();
            if (filtro === 'todos' || estado === filtro) {
                fila.style.display = '';
            } else {
                fila.style.display = 'none';
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

    function capitalizar(texto) {
        return texto.charAt(0).toUpperCase() + texto.slice(1);
    }
});