import express from 'express';
import { 
    formularioLogin,
    autenticar, 
    formularioRegistro, 
    formularioOlvidePassword, 
    registrar, 
    confirmar,
    resetPassword,
    comprobarToken,
    nuevoPassword,
    cerrarSesion
} from '../controllers/usuarioController.js';

const router = express.Router();

router.get('/login', formularioLogin);
router.post('/login', autenticar);

router.post('/cerrar-sesion', cerrarSesion);

router.get('/registro', formularioRegistro);
router.post('/registro', registrar);

router.get('/confirmar/:token', confirmar);

router.get('/password-olvidada', formularioOlvidePassword);
router.post('/password-olvidada', resetPassword);
router.get('/password-olvidada/:token', comprobarToken);
router.post('/password-olvidada/:token', nuevoPassword);


export default router;