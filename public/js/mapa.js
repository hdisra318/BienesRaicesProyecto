/*
 * ATTENTION: The "eval" devtool has been used (maybe by default in mode: "development").
 * This devtool is neither made for production nor for readable output files.
 * It uses "eval()" calls to create a separate source file in the browser devtools.
 * If you are trying to read the output file, select a different devtool (https://webpack.js.org/configuration/devtool/)
 * or disable the default devtool with "devtool: false".
 * If you are looking for production-ready output files, see mode: "production" (https://webpack.js.org/configuration/mode/).
 */
/******/ (() => { // webpackBootstrap
/******/ 	"use strict";
/******/ 	var __webpack_modules__ = ({

/***/ "./src/js/mapa.js":
/*!************************!*\
  !*** ./src/js/mapa.js ***!
  \************************/
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {

eval("__webpack_require__.r(__webpack_exports__);\n(function() {\r\n\r\n    const lat = document.querySelector('#lat').value || 19.4246585;\r\n    const lng = document.querySelector('#lng').value || -99.1664769;\r\n\r\n    const mapa = L.map('mapa').setView([lat, lng ], 17);\r\n    let pin;\r\n\r\n    // Provider y Geocoder\r\n    const geocodeService = L.esri.Geocoding.geocodeService();\r\n    \r\n\r\n    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {\r\n        attribution: '&copy; <a href=\"https://www.openstreetmap.org/copyright\">OpenStreetMap</a> contributors'\r\n    }).addTo(mapa);\r\n\r\n\r\n    // Pin\r\n    pin = new L.marker([lat, lng], {\r\n        draggable: true,\r\n        autoPan: true\r\n    }).addTo(mapa);\r\n\r\n    // Detectando el movimiento de pin\r\n    pin.on('moveend', function(e) {\r\n        pin = e.target;\r\n\r\n        // Obteniendo coordenadas\r\n        const posicion = pin.getLatLng();\r\n\r\n        // Centrar el mapa\r\n        mapa.panTo(new L.LatLng(posicion.lat, posicion.lng));\r\n\r\n        // Obteniendo la informacion de las calles\r\n        geocodeService.reverse().latlng(posicion, 17).run(function(error, resul) {\r\n\r\n            // Mostrando el globo de informacion\r\n            pin.bindPopup(resul.address.LongLabel);\r\n\r\n            // Mostrando la informacion en parrafos\r\n            document.querySelector('.calle').textContent = resul?.address?.Address ?? ''\r\n            document.querySelector('#calle').value = resul?.address?.Address ?? ''\r\n            document.querySelector('#lat').value = resul?.latlng?.lat ?? ''\r\n            document.querySelector('#lng').value = resul?.latlng?.lng ?? ''\r\n\r\n        })\r\n\r\n    });\r\n\r\n}) ();\n\n//# sourceURL=webpack://bienesraices_mvc/./src/js/mapa.js?");

/***/ })

/******/ 	});
/************************************************************************/
/******/ 	// The require scope
/******/ 	var __webpack_require__ = {};
/******/ 	
/************************************************************************/
/******/ 	/* webpack/runtime/make namespace object */
/******/ 	(() => {
/******/ 		// define __esModule on exports
/******/ 		__webpack_require__.r = (exports) => {
/******/ 			if(typeof Symbol !== 'undefined' && Symbol.toStringTag) {
/******/ 				Object.defineProperty(exports, Symbol.toStringTag, { value: 'Module' });
/******/ 			}
/******/ 			Object.defineProperty(exports, '__esModule', { value: true });
/******/ 		};
/******/ 	})();
/******/ 	
/************************************************************************/
/******/ 	
/******/ 	// startup
/******/ 	// Load entry module and return exports
/******/ 	// This entry module can't be inlined because the eval devtool is used.
/******/ 	var __webpack_exports__ = {};
/******/ 	__webpack_modules__["./src/js/mapa.js"](0, __webpack_exports__, __webpack_require__);
/******/ 	
/******/ })()
;