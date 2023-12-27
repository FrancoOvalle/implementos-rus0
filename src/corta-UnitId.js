const CATALOGOCATEGORIUNIDADRUSO = require("./models/catalogosCategoriasUnidad.models");

let App = async ()=> {
    const codigos = CATALOGOCATEGORIUNIDADRUSO.distinct("UnitId").lean()

    const formattedString = originalString.slice(0, 1) + "-" + 
    originalString.slice(1, 3) + "-" + 
    originalString.slice(3, 5) + "-" + 
    originalString.slice(5);

    console.log(formattedString); // Salida: 4-07-20-5016
}

App();

