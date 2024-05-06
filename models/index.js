import Propiedad from './Propiedad.js'
import Precio from './Precio.js'
import Categoria from './Categoria.js'
import Usuario from './Usuario.js'
import Mensaje from './Mensaje.js';

// Relacion 1 a 1 (Propiedad) <--> (Precio)
Propiedad.belongsTo(Precio, {foreignKey: 'precioId'});

// Relacion 1 a 1 (Propiedad) <--> (Categoria)
Propiedad.belongsTo(Categoria, {foreignKey: 'categoriaId'});

// Relacion 1 a 1 (Propiedad) <--> (Usuario)
Propiedad.belongsTo(Usuario, {foreignKey: 'usuarioId'});

// Propiedad con muchos mensajes
Propiedad.hasMany(Mensaje, {foreignKey: 'propiedadId'})

Mensaje.belongsTo(Propiedad, {foreignKey: 'propiedadId'});
Mensaje.belongsTo(Usuario, {foreignKey: 'usuarioId'});

export {
    Propiedad,
    Precio,
    Categoria,
    Usuario,
    Mensaje
}