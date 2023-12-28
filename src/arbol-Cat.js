const catalogCategoria = require('./models/catalogosCategorias.models')
const catUnidadRuso = require('./models/catalogosCategoriasUnidad.models')
const catVehiculo = require('./models/catalogoVehiculos.model')



const arbol = async (vehicleId) => {

  let unitIds = await catVehiculo.distinct("UnitId", { VehicleId: vehicleId });

let pipeline = [
  {
    $match: {
      UnitId: { $in: unitIds }
    }
  },
  {
    $lookup: {
      from: "catalogosCategoriaUnidadesImagenRuso",
      localField: "UnitId",
      foreignField: "UnitId",
      as: "unidadImagen"
    }
  },
  {
    $unwind: "$unidadImagen"
  },
  {
    $project: {
      CategoryId: 1,
      NameCategorie: 1,
      UnitId: 1,
      ImageUrl: 1,
      NameUnit: 1,
      Code: 1,
      codigo: "$unidadImagen.codigo",
      nombre: "$unidadImagen.nombre",
      OEM: "$unidadImagen.OEM",
      cantidad: "$unidadImagen.cantidad",
      coordenadas: "$unidadImagen.coordenadad",
      _id: 0
    }
  }
];

var respuesta = await catUnidadRuso.aggregate(pipeline);
console.log(JSON.stringify(respuesta, null, 2));
  };
  
  arbol(4407251)