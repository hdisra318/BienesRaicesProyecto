import { validationResult } from "express-validator";
import {unlink} from 'node:fs/promises';

import {Precio, Categoria, Propiedad, Mensaje, Usuario} from '../models/index.js'
import { esVendedor, formatearFecha } from "../helpers/index.js";

const admin = async (req, res) => {

     // Leyendo QueryString ?pagina=1
     const {pagina: paginaActual} = req.query;
     const expresion = /^[0-9]$/
 
     if(!expresion.test(paginaActual)){
         // Si no se le pasan numeros o no existe
         return res.redirect('/mis-propiedades?pagina=1')
     }

    try {

        const {id} = req.usuario;

        // Limite del paginador
        const limite = 10
        const offset = (paginaActual * limite) - limite;

        const [propiedades, total] = await Promise.all([
            Propiedad.findAll({
                limit: limite,
                offset: offset,
                where: {
                    usuarioId: id
                },
                include: [ // Hace un inner JOIN con la tabla de Categoria y Precio
                    {model: Categoria, as: 'categoria'},
                    {model: Precio, as: 'precio'},
                    {model: Mensaje, as: 'mensajes'}
                ]
            }),
            Propiedad.count({
                where: {
                    usuarioId: id
                }
            })
        ])

        res.render('propiedades/admin', {
            pagina: 'Mis Propiedades',
            csrfToken: req.csrfToken(),
            propiedades,
            paginas: Math.ceil(total / limite),
            paginaActual: Number(paginaActual),
            total,
            offset,
            limite
        });

    } catch(error) {
        console.log(error);
    }
}


const crear = async (req, res) => {

    // Consultando los modelos de Precio y Categoria
    const [categorias, precios] = await Promise.all([
        Categoria.findAll(),
        Precio.findAll()
    ])


    res.render('propiedades/crear', {
        pagina: 'Crear Propiedad',
        csrfToken: req.csrfToken(),
        categorias,
        precios,
        datos: {}
    })
}


const guardar = async (req, res) => {

    // Resultado de la validacion hecha en el routing
    let resultado = validationResult(req);

    if(!resultado.isEmpty()) {
        
        // Consultando los modelos de Precio y Categoria
        const [categorias, precios] = await Promise.all([
            Categoria.findAll(),
            Precio.findAll()
        ])
        
        return res.render('propiedades/crear', {
            pagina: 'Crear Propiedad',
            csrfToken: req.csrfToken(),
            categorias,
            precios,
            errores: resultado.array(),
            datos: req.body
        })
    }

    // Creando un registro
    const {titulo, descripcion, habitaciones, estacionamiento, wc, calle, lat, lng, precio: precioId, categoria: categoriaId} = req.body;
    const {id: usuarioId} = req.usuario;

    try {
        
        const propiedadAlmacenada = await Propiedad.create({
            titulo: titulo,
            descripcion,
            habitaciones,
            estacionamiento,
            wc,
            calle,
            lat,
            lng,
            precioId,
            categoriaId,
            usuarioId,
            imagen: ''
        });

        const {id} = propiedadAlmacenada;

        res.redirect(`/propiedades/agregar-imagen/${id}`);

    } catch (error) {
        console.log(error);
    }

}


/* Para abrir la pagina de "agregar-imagen" */
const agregarImagen = async (req, res) => {

    const {id} = req.params;

    // Validando que la propiedad exista
    const propiedad = await Propiedad.findByPk(id)

    if(!propiedad) {
        // Si no existe
        return res.redirect('/mis-propiedades');
    }

    // Validando que la propiedad no este publicada aun
    if(propiedad.publicado) {
        return res.redirect('/mis-propiedades');
    }

    // Validando que la propiedad pertenece a quien visita la pagina
    if(req.usuario.id.toString() !== propiedad.usuarioId.toString()) {
        return res.redirect('/mis-propiedades');
    }

    res.render('propiedades/agregar-imagen', {
        pagina: `Agregar Imagen: ${propiedad.titulo}`,
        csrfToken: req.csrfToken(),
        propiedad: propiedad
    })
}


/* Almacena las imagenes subidas al dar click en el boton */
const almacenarImagen = async (req, res, next) => {

    const {id} = req.params;

    // Validando que la propiedad exista
    const propiedad = await Propiedad.findByPk(id)

    if(!propiedad) {
        // Si no existe
        return res.redirect('/mis-propiedades');
    }

    // Validando que la propiedad no este publicada aun
    if(propiedad.publicado) {
        return res.redirect('/mis-propiedades');
    }

    // Validando que la propiedad pertenece a quien visita la pagina
    if(req.usuario.id.toString() !== propiedad.usuarioId.toString()) {
        return res.redirect('/mis-propiedades');
    }

    try {
        
        // Almacenando la imagen en la BD y publicando la propiedad
        propiedad.imagen = req.file.filename;
        propiedad.publicado = 1;

        await propiedad.save();

        next();

    } catch (error) {
        console.log(error);
    }
}


/** Edita la propiedad */
const editar = async (req, res) => {

    // Validando que la propiedad exista
    const {id} = req.params;
    const propiedad = await Propiedad.findByPk(id);

    // Si no hay
    if(!propiedad) {
        return res.redirect('/mis-propiedades');
    }

    // Revisando que quien visita la url le pertenece la propiedad a editar
    if(propiedad.usuarioId.toString() !== req.usuario.id.toString()) {
        return res.redirect('/mis-propiedades');
    }

    const [categorias, precios] = await Promise.all([
        Categoria.findAll(),
        Precio.findAll()
    ])

    res.render('propiedades/editar', {
        pagina: `Editar Propiedad: ${propiedad.titulo}`,
        csrfToken: req.csrfToken(),
        categorias,
        precios,
        datos: propiedad
    })
};


/** Guarda los cambios de editar en la BD */
const guardarCambios = async (req, res) => {

    // Verificando la validacion del formulario
    let resultado = validationResult(req);

    if(!resultado.isEmpty()) {
        
        // Consultando los modelos de Precio y Categoria
        const [categorias, precios] = await Promise.all([
            Categoria.findAll(),
            Precio.findAll()
        ])
        
        res.render('propiedades/editar', {
            pagina: `Editar Propiedad`,
            csrfToken: req.csrfToken(),
            categorias,
            precios,
            datos: req.body,
            errores: resultado.array()
        })
    }

    // Validando que la propiedad exista
    const {id} = req.params;
    const propiedad = await Propiedad.findByPk(id);

    // Si no hay
    if(!propiedad) {
        return res.redirect('/mis-propiedades');
    }

    // Revisando que quien visita la url le pertenece la propiedad a editar
    if(propiedad.usuarioId.toString() !== req.usuario.id.toString()) {
        return res.redirect('/mis-propiedades');
    }


    // Reescribiendo el objeto en la BD
    try {
        
        const {titulo, descripcion, habitaciones, estacionamiento, wc, calle, lat, lng, precio: precioId, categoria: categoriaId} = req.body;
    
        propiedad.set({
            titulo,
            descripcion,
            habitaciones,
            estacionamiento,
            wc,
            calle,
            lat,
            lng,
            precioId,
            categoriaId
        });

        await propiedad.save();

        res.redirect('/mis-propiedades');

    } catch (error) {
        console.log(error);    
    }

}


/** Elimina la propiedad de la BD */
const eliminar = async (req, res) => {

    // Validando que la propiedad exista
    const {id} = req.params;
    const propiedad = await Propiedad.findByPk(id);

    // Si no hay
    if(!propiedad) {
        return res.redirect('/mis-propiedades');
    }

    // Revisando que quien visita la url le pertenece la propiedad a editar
    if(propiedad.usuarioId.toString() !== req.usuario.id.toString()) {
        return res.redirect('/mis-propiedades');
    }


    // Eliminando la imagen guardada en el uploads
    await unlink(`public/uploads${propiedad.imagen}`);

    // Eliminando propiedad
    await propiedad.destroy();

    res.redirect('/mis-propiedades');

}


// AREA PUBLICA
const mostrarPropiedad = async (req, res) => {

    const {id} = req.params;
    // Comprobando que la propiedad exista
    const propiedad = await Propiedad.findByPk(id, {
        include: [ // Hace un inner JOIN con la tabla de Categoria y Precio
            {model: Categoria, as: 'categoria'},
            {model: Precio, as: 'precio'}
        ]
    })

    if(!propiedad || !propiedad.publicado) {
        return res.redirect('/404');
    }

    res.render('propiedades/mostrar', {
        propiedad,
        pagina: propiedad.titulo,
        csrfToken: req.csrfToken(),
        usuario: req.usuario,
        esVendedor: esVendedor(req.usuario?.id, propiedad.usuarioId)
    });
}


// Envia el mensaje del formulario para contactar al vendedor
const enviarMensaje = async (req, res) => {

    const {id} = req.params;
    // Comprobando que la propiedad exista
    const propiedad = await Propiedad.findByPk(id, {
        include: [ // Hace un inner JOIN con la tabla de Categoria y Precio
            {model: Categoria, as: 'categoria'},
            {model: Precio, as: 'precio'}
        ]
    })

    if(!propiedad) {
        return res.redirect('/404');
    }

    // Renderizando los errores del formulario
    let resultado = validationResult(req);

    if(!resultado.isEmpty()) {
        
        return res.render('propiedades/mostrar', {
            propiedad,
            pagina: propiedad.titulo,
            csrfToken: req.csrfToken(),
            usuario: req.usuario,
            esVendedor: esVendedor(req.usuario?.id, propiedad.usuarioId),
            errores: resultado.array()
        });
    }

    // Almacenando el mensaje
    const {mensaje} = req.body;
    const {id: propiedadId} = req.params;
    const {id: usuarioId} = req.usuario;

    await Mensaje.create({
        mensaje,
        propiedadId,
        usuarioId
    })

    res.redirect('/');
}

// Lee los mensajes recibidos
const verMensajes = async (req, res) => {

    // Validando que la propiedad exista
    const {id} = req.params;

    // Propiedad cruzando con mensajes y mensajes con usuarios para obtener el usuairio del mensaje de la propiedad
    const propiedad = await Propiedad.findByPk(id, {
        include: [
            {model: Mensaje, as: 'mensajes', 
                include: [
                    {model: Usuario.scope('eliminarPassword'), as: 'usuario'}
                ]
            }
        ]
    });
 
    // Si no hay
    if(!propiedad) {
        return res.redirect('/mis-propiedades');
    }
 
    // Revisando que quien visita la url le pertenece la propiedad a editar
    if(propiedad.usuarioId.toString() !== req.usuario.id.toString()) {
        return res.redirect('/mis-propiedades');
    }


    res.render('propiedades/mensajes', {
        pagina: 'Mensajes',
        mensajes: propiedad.mensajes,
        formatearFecha
    });
}


/** Modifica el estado de la propiedad */
const cambiarEstado = async (req, res) => {
    
    // Validando que la propiedad exista
    const {id} = req.params;
    const propiedad = await Propiedad.findByPk(id);

    // Si no hay
    if(!propiedad) {
        return res.redirect('/mis-propiedades');
    }

    // Revisando que quien visita la url le pertenece la propiedad a editar
    if(propiedad.usuarioId.toString() !== req.usuario.id.toString()) {
        return res.redirect('/mis-propiedades');
    }

    
    // Actualizando
    propiedad.publicado = !propiedad.publicado;

    await propiedad.save();

    res.json({
        resultado: 'OK'
    })

}


export {
    admin,
    crear,
    guardar,
    agregarImagen,
    almacenarImagen,
    editar,
    guardarCambios,
    eliminar,
    mostrarPropiedad,
    enviarMensaje,
    verMensajes,
    cambiarEstado
}