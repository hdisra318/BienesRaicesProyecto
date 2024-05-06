(function() {

    const lat = 19.4246585;
    const lng = -99.1664769;
    const mapa = L.map('mapa-inicio').setView([lat, lng ], 14);

    // Pines del mapa de las propiedades
    let pines = new L.FeatureGroup().addTo(mapa);

    let propiedades = []

    const categoriasSelect = document.querySelector('#categorias');
    const preciosSelect = document.querySelector('#precios');

    // Filtros
    const filtros = {
        categoria: '',
        precio: ''
    }


    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
    }).addTo(mapa);


    // Filtrando categorias y precios
    categoriasSelect.addEventListener('change', e => {
        filtros.categoria = +e.target.value;
        filtrarPropiedades();
    })

    preciosSelect.addEventListener('change', e => {
        filtros.precio = +e.target.value;
        filtrarPropiedades();
    })


    // Consumiendo API apiController
    const obtenerPropiedades = async () => {

        try {
            
            const url = '/api/propiedades';
            const response = await fetch(url);
            propiedades = await response.json();

            mostrarPropiedades(propiedades);

        } catch (error) {
            console.log(error)
        }
    }


    const mostrarPropiedades = propiedades => {

        // Limpiando los pines previos
        pines.clearLayers();

        propiedades.forEach(propiedad => {
            console.log(propiedad.titulo)
            // Agregando los pines
            const pin = new L.marker([propiedad?.lat, propiedad?.lng], {
                autoPan: true
            })
            .addTo(mapa)
            .bindPopup(`
                <p class="text-teal-600 font-bold">${propiedad?.categoria.nombre}</p>
                <h1 class="text-xl font-extrabold my-2">${propiedad?.titulo}</h1>
                <img src="/uploads/${propiedad?.imagen}" alt="Imagen de la propiedad ${propiedad?.titulo}">
                <p class="text-gray-600 font-bold">${propiedad?.precio.nombre}</p>
                <a href="/propiedad/${propiedad?.id}" class="bg-teal-600 block p-2 text-center font-bold rounded">Ver Propiedad</a>
            `);


            pines.addLayer(pin)
        })
    }


    const filtrarPropiedades = () => {

        const resultado = propiedades.filter(filtrarCategoria).filter(filtrarPrecio);
        mostrarPropiedades(resultado);
    }

    const filtrarCategoria = (propiedad) => {
        return filtros.categoria ? propiedad.categoriaId === filtros.categoria : propiedad;
    }

    const filtrarPrecio = propiedad => {
        return filtros.precio ? propiedad.precioId === filtros.precio : propiedad;
    }

    obtenerPropiedades();

})();