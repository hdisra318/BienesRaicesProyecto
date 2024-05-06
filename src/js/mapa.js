(function() {

    const lat = document.querySelector('#lat').value || 19.4246585;
    const lng = document.querySelector('#lng').value || -99.1664769;

    const mapa = L.map('mapa').setView([lat, lng ], 17);
    let pin;

    // Provider y Geocoder
    const geocodeService = L.esri.Geocoding.geocodeService();
    

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
    }).addTo(mapa);


    // Pin
    pin = new L.marker([lat, lng], {
        draggable: true,
        autoPan: true
    }).addTo(mapa);

    // Detectando el movimiento de pin
    pin.on('moveend', function(e) {
        pin = e.target;

        // Obteniendo coordenadas
        const posicion = pin.getLatLng();

        // Centrar el mapa
        mapa.panTo(new L.LatLng(posicion.lat, posicion.lng));

        // Obteniendo la informacion de las calles
        geocodeService.reverse().latlng(posicion, 17).run(function(error, resul) {

            // Mostrando el globo de informacion
            pin.bindPopup(resul.address.LongLabel);

            // Mostrando la informacion en parrafos
            document.querySelector('.calle').textContent = resul?.address?.Address ?? ''
            document.querySelector('#calle').value = resul?.address?.Address ?? ''
            document.querySelector('#lat').value = resul?.latlng?.lat ?? ''
            document.querySelector('#lng').value = resul?.latlng?.lng ?? ''

        })

    });

}) ();