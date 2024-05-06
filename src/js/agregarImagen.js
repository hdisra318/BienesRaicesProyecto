import {Dropzone} from 'dropzone';

const token = document.querySelector('meta[name="csrf-token"]').getAttribute('content');

Dropzone.options.imagen = {
    dictDefaultMessage: 'Sube o arrastra las imagenes aquí',
    acceptedFiles: '.png,.jpg,.jpeg',
    maxFilesize: 10, // 10 megas
    maxFiles: 1, // 1 imagen maxima
    parallelUploads: 1,
    autoProcessQueue: false, // Para que se suba la imagen hasta dar en submit
    addRemoveLinks: true, // Para que apareza el boton de eliminar
    dictRemoveFile: 'Borrar archivo',
    dictMaxFilesExceeded: 'El límite para subir es 1 archivo',
    headers: {
        'CSRF-Token': token
    },
    paramName: 'imagen',
    init: function() {
        // Para acceder a los eventos
        const dropzone = this;
        const btnPublicar = document.querySelector('#publicar');

        btnPublicar.addEventListener('click', function() {
            dropzone.processQueue(); // Guarda la imagen
        });

        dropzone.on('queuecomplete', function() {
            // Si ya no hay archivos subiendose
            if(dropzone.getActiveFiles().length === 0){
                window.location.href = '/mis-propiedades';
            }
        });

    }
}