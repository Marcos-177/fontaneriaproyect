document.addEventListener('DOMContentLoaded', () => {
    // Simulación de datos para los contadores
    const actualizarContadores = () => {
        document.getElementById('contador-servicios').textContent = '24';
        document.getElementById('contador-productos').textContent = '156';
        document.getElementById('contador-clientes').textContent = '89';
    };

    actualizarContadores();
});