import categorias from "./categorias.js";
import precios from "./precios.js";
import usuarios from "./usuarios.js";

import {Categoria, Precio, Usuario} from '../models/index.js';

import db from "../config/db.js";


const importarDatos = async () => {

    try {

        // Autenticando en la DB
        await db.authenticate();

        // Generando Columnas en la DB
        await db.sync()

        

        await Promise.all([
            // Insertando valores de categorias a la tabla
            Categoria.bulkCreate(categorias),
            // Insertando valores de precios a la tabla
            Precio.bulkCreate(precios),
            // Insertando el usuario a la tabla
            Usuario.bulkCreate(usuarios)
        ])


        console.log('Datos importados correctamente');


        process.exit()


    } catch(error) {
        console.log(error);
        process.exit(1);
    }
}

const eliminarDatos = async () => {
    try {

        await Promise.all([
            Categoria.destroy({where: {}, TRUNCATE: true}),
            Precio.destroy({where: {}, TRUNCATE: true}),
            db.sync({force: true})
        ])
        console.log("Datos eliminados");
        process.exit()
    } catch(error) {
        console.log(error)
        process.exit(1)
    }
}


if(process.argv[2] === '-i') {
    importarDatos();
}

if(process.argv[2] === '-e') {
    eliminarDatos();
}