import express from 'express'; //ECMAScript Modules
import csurf from 'csurf';
import cookieParser from 'cookie-parser';
import usuarioRoutes from './routes/usuarioRoutes.js';
import propiedadesApi from './routes/propiedadesRoutes.js';
import appRoutes from './routes/appRoutes.js';
import apiRoutes from './routes/apiRoutes.js';
import db from './config/db.js';

// Creando la app
const app = express();

// Habilitando lectura de datos del formulario
app.use(express.urlencoded({extended: true}))

// Habilitando Cookie Parser
app.use(cookieParser());

// Habilitando CSRF
app.use(csurf({cookie: true}))


// Conexion a la base de datos
try {
    await db.authenticate();
    db.sync()
    console.log("Conexión Exitosa a la Base de Datos")
} catch(error) {
    console.log(error);
}

// Habilitando Pug
app.set('view engine', 'pug');
app.set('views', './views')

// Carpeta public
app.use(express.static('public'));

// Routing
app.use('/', appRoutes)
app.use('/auth', usuarioRoutes);
app.use('/', propiedadesApi);
app.use('/api', apiRoutes);




// Definiendo el puerto
const port = process.env.PORT || 3000;

app.listen(port, () => {
    console.log(`Servidor corriendo en el puerto ${port}`)
})