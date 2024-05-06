const esVendedor = (usuarioId, propiedadUsuario) => {
    return usuarioId === propiedadUsuario; // Si es el vendedor el que visita la pagina
}

// Formatea la fecha de createdAt
const formatearFecha = fecha => {

    const nuevaFecha = new Date(fecha).toISOString().slice(0, 10);// Para obtener solo el 2024-04-28

    const opciones = {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    }

    return new Date(nuevaFecha).toLocaleDateString('es-ES', opciones)

}

export {
    esVendedor,
    formatearFecha
}