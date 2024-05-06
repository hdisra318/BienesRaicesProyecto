/* Controlador de los usuarios */
import { check, validationResult } from "express-validator";
import bcrypt from 'bcrypt';

import Usuario from "../models/Usuario.js";
import { generarId, generarJWT } from "../helpers/tokens.js";
import { emailRegistro, emailOlvidePassword } from "../helpers/emials.js";

const formularioLogin = (req, res) => {
    res.render('auth/login', {
        pagina: 'Iniciar Sesión',
        csrfToken: req.csrfToken()
    });
}

const autenticar = async (req, res) => {
    
    // Validando
    await check('email').isEmail().withMessage('El email es obligatorio').run(req);
    await check('password').notEmpty().withMessage('El password es obligatorio').run(req);

    let resultado = validationResult(req);

    if(!resultado.isEmpty()) {
        return res.render('auth/login', {
            pagina: 'Iniciar Sesión',
            csrfToken: req.csrfToken(),
            errores: resultado.array()
        })
    }

    // Comprobando si el usuario existe
    const {email, password} = req.body;

    const usuario = await Usuario.findOne({where: {email}});
    if(!usuario) {
        return res.render('auth/login', {
            pagina: 'Iniciar Sesión',
            csrfToken: req.csrfToken(),
            errores: [{msg: 'El usuario no existe'}]
        })
    }

    // Comprobando si ya se confirmo la cuenta
    if(!usuario.confirmado) {
        return res.render('auth/login', {
            pagina: 'Iniciar Sesión',
            csrfToken: req.csrfToken(),
            errores: [{msg: 'Tu cuenta no ha sido confirmada'}]
        })
    }

    // Comprobando el password
    if(!usuario.verificarPassword(password)) {
        return res.render('auth/login', {
            pagina: 'Iniciar Sesión',
            csrfToken: req.csrfToken(),
            errores: [{msg: 'Password incorrecto'}]
        })
    }

    // Autenticando al usuario
    const token = generarJWT({id: usuario.id, nombre: usuario.nombre});

    // Almacenando en una cookie
    return res.cookie('_token', token, {
        httpOnly: true,
        //secure: true
    }).redirect('/mis-propiedades')

}

const formularioRegistro = (req, res) => {
    res.render('auth/registro', {
        pagina: 'Crear Cuenta',
        csrfToken: req.csrfToken()
    });
}

const formularioOlvidePassword = (req, res) => {
    res.render('auth/password-olvidada', {
        pagina: 'Recupera tu acceso a Bienes Raices',
        csrfToken: req.csrfToken()
    })
}

async function registrar(req, res) {
    // console.log('Registrando...')
    // Validacion
    await check('nombre').notEmpty().withMessage('El nombre es obligatorio').run(req);
    await check('email').isEmail().withMessage('Email no válido').run(req);
    await check('password').isLength({min: 6}).withMessage('La contraseña debe de ser de al menos 6 caracteres').run(req);

    // Verificando si el resultado esta vacio (todo correcto)
    let result = validationResult(req);
    if(!result.isEmpty()) {
        // Errores
        return res.render('auth/registro', {
            pagina: 'Crear Cuenta',
            csrfToken: req.csrfToken(),
            errores: result.array(),
            usuario: {
                nombre: req.body.nombre,
                email: req.body.email
            }
        })
    }

    if(req.body.password !== req.body.repetir_password) {
        return res.render('auth/registro', {
            pagina: 'Crear Cuenta',
            errores: [{msg: 'Las contraseñas no son iguales'}],
            usuario: {
                nombre: req.body.nombre,
                email: req.body.email
            }
        })
    }

    // Verificando que el usuario no tenga el mismo email
    const existeUsuario = await Usuario.findOne({where: {email: req.body.email}});

    if(existeUsuario) {
        return res.render('auth/registro', {
            pagina: 'Crear Cuenta',
            csrfToken: req.csrfToken(),
            errores: [{msg: 'Usuario ya registrado'}],
            usuario: {
                nombre: req.body.nombre,
                email: req.body.email
            }
        })
    }

    // Almacenando un usuario en la DB
    const {nombre, email, password} = req.body;
    const usuario = await Usuario.create({
        nombre,
        email,
        password,
        token: generarId()
    });


    // Enviando email de confirmacion
    emailRegistro({
        nombre: usuario.nombre,
        email: usuario.email,
        token: usuario.token
    })
    
    // Mostrando mensaje de confirmar email
    res.render('templates/mensaje', {
        pagina: 'Cuenta creada correctamente',
        mensaje: `Hemos enviado un email de confirmación al correo ${email}, presiona en el enlace.`
    })


}

// Confirma la cuenta
const confirmar = async (req, res) => {

    const {token} = req.params;

    // Verificando si el token es valido
    const usuario = await  Usuario.findOne({where: {token}})

    if(!usuario){

        return res.render('auth/confirmar-cuenta', {
            pagina: 'Error al confirmar la cuenta',
            mensaje: 'Hubo un error al confirmar la cuenta, intenta de nuevo',
            error: true
        })
    }

    // Confirmando el usaurio
    usuario.token = null; // Eliminando token
    usuario.confirmado = true;
    await usuario.save();

    return res.render('auth/confirmar-cuenta', {
        pagina: 'Cuenta Confirmada',
        mensaje: 'La cuenta se confirmó correctamente',
        error: false
    })

}


const resetPassword = async (req, res) => {

    // Validacion
    await check('email').isEmail().withMessage('Email no válido').run(req);
    
    // Verificando si el resultado esta vacio (todo correcto)
    let result = validationResult(req);
    if(!result.isEmpty()) {
        // Errores
        return res.render('auth/password-olvidada', {
            pagina: 'Recupera tu acceso a Bienes Raices',
            csrfToken: req.csrfToken(),
            errores: result.array()
        })
    }

    // Buscando el usuario en la DB
    const  {email} = req.body;

    const usuario = await Usuario.findOne({where: {email}});

    if(!usuario) {
        return res.render('auth/password-olvidada', {
            pagina: 'Recupera tu acceso a Bienes Raices',
            csrfToken: req.csrfToken(),
            errores: [{msg: 'Email no encontrado'}]
        })
    }


    // Generando token y enviando email
    usuario.token = generarId()
    await usuario.save()

    // Enviando email
    emailOlvidePassword({
        email: usuario.email,
        nombre: usuario.nombre,
        token: usuario.token
    })

    res.render('templates/mensaje', {
        pagina: 'Reestablece tu Password',
        mensaje: 'Hemos enviado un email con las instrucciones para que puedas reestablecer tu Password.'
    })
    
}


const comprobarToken = async (req, res) => {

    const {token} = req.params;

    const usuario = await Usuario.findOne({where: {token}})

    // Usuario no valido
    if(!usuario) {
        return res.render('auth/confirmar-cuenta', {
            pagina: 'Reestablece tu Password',
            mensaje: 'Hubo un error al validar tu información, intenta de nuevo',
            error: true
        })
    }

    // Mostrando formulario para agregar un nuevo password
    res.render('auth/reset-password', {
        pagina: 'Reestablece tu Password',
        csrfToken: req.csrfToken()
    })


}

const nuevoPassword = async (req, res) => {
    
    // Validando password
    await check('password').isLength({min: 6}).withMessage('El Password debe ser de almenos 6 caracteres').run(req);

    let resultado = validationResult(req);

    if(!resultado.isEmpty()) {
        return res.render('auth/reset-password', {
            pagina: 'Reestablece tu Password',
            csrfToken: req.csrfToken(),
            errores: resultado.array()
        })
    }

    // Identificando cual usuario hace el cambio
    const {token} = req.params;
    const {password} = req.body;

    const usuario = await Usuario.findOne({where: {token}});

    // Hasheando nuevo password
    const salt = await bcrypt.genSalt(10);
    usuario.password = await bcrypt.hash(password, salt);
    usuario.token = null;

    await usuario.save();

    res.render('auth/confirmar-cuenta', {
        pagina: 'Password reestablecida',
        mensaje: 'Password guardada con éxito'
    })

}


const cerrarSesion = async (req, res) => {

    return res.clearCookie('_token').status(200).redirect('/auth/login');
}

export {
    formularioLogin,
    autenticar,
    formularioRegistro,
    registrar,
    formularioOlvidePassword,
    confirmar,
    resetPassword,
    comprobarToken,
    nuevoPassword,
    cerrarSesion
}