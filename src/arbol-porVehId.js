const catUnidadRuso = require('./models/catalogosCategoriasUnidad.models')
const catVehiculo = require('./models/catalogoVehiculos.model')
const catalogCategoria = require('./models/catalogosCategorias.models')

let vehicleId = 4407251

const App = async (vehicleId) => {
    const datos = await catVehiculo.distinct("UnitId", {VehicleId: vehicleId})
    const data = await catUnidadRuso.aggregate([
        {
            $match:{
                VehicleId: vehicleId,
            }
        },
        {
            $group: {
                _id: {
                    VehicleId: "$VehicleId",
                    CategoryId: "$CategoryId",
                    NameCategorie:"$NameCategorie"
                },
                items: { 
                    $push: {
                        Code: "$Code",
                        ImageUrl: "$ImageUrl",
                        NameUnit: "$NameUnit"
                    }
                }
            }
        },
        {
            $project: {
                _id: 0,
                VehicleId: "$_id.VehicleId",
                CategoryId: "$_id.CategoryId",
                NameCategorie:"$_id.NameCategorie",
                Items: "$items" 
            }
        }
    ]);
    
    // console.log(data);
    for (const itemsCat of datos) {
        // console.log(itemsCat);
        for (const item of data) {
        if(item.CategoryId == itemsCat){
            console.log("Nombre Categoria: "+ item.NameCategorie);
            console.log("Cat General: "+ itemsCat.slice(0,3));
            console.log("Sub-Categoria: "+itemsCat.slice(3,5));
            console.log(itemsCat, item.Items);
            
            }
        }
    }
}

App(vehicleId)