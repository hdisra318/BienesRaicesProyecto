import nodemailer from 'nodemailer';


const emailRegistro = async (datos) => {

    const {email, nombre, token} = datos;

    const transport = nodemailer.createTransport({
        host: process.env.EMAIL_HOST,
        port: process.env.EMAIL_PORT,
        auth: {
          user: process.env.EMAIL_USER,
          pass: process.env.EMAIL_PASS
        }
    });


    // Enviando correo
    await transport.sendMail({
        from: 'BienesRaices.com',
        to: email,
        subject: 'Confirma tu Cuenta de BienesRaices.com',
        text: 'Confirma tu Cuenta de BienesRaices.com',
        html: `
            <p>Hola ${nombre}, comprueba tu cuenta de BienesRaices.com</p>
            <p>Tu cuenta ya está lista, sólo debes confirmarla dando click en el siguiente enlace:
            <a href="${process.env.BACKEND_URL}:${process.env.PORT ?? 3000}/auth/confirmar/${token}">Confirmar Cuenta</a></p>

            <p>Si tu no la creaste, puedes ignorar este mensaje</p>
        `
    })


}


const emailOlvidePassword = async (datos) => {

    const {email, nombre, token} = datos;

    const transport = nodemailer.createTransport({
        host: process.env.EMAIL_HOST,
        port: process.env.EMAIL_PORT,
        auth: {
          user: process.env.EMAIL_USER,
          pass: process.env.EMAIL_PASS
        }
    });


    // Enviando correo
    await transport.sendMail({
        from: 'BienesRaices.com',
        to: email,
        subject: 'Reestablece tu password en BienesRaices.com',
        text: 'Reestablece tu password en BienesRaices.com',
        html: `
            <p>Hola ${nombre}, has solicitado reestablecer tu password en BienesRaices.com</p>
            <p>Sigue el siguiente enlace para generar un password nuevo:
            <a href="${process.env.BACKEND_URL}:${process.env.PORT ?? 3000}/auth/password-olvidada/${token}">Reestablecer Password</a></p>

            <p>Si tu no solicitaste el cambio de password, puedes ignorar este mensaje</p>
        `
    })


}


export {
    emailRegistro,
    emailOlvidePassword
}