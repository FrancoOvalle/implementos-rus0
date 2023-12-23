const axios = require('axios');
const RUSO = require('./models/rusoData.model'); 
const RUSOFILTRO = require('./models/rusoDataFiltro.model'); 

async function CONSULTARUSAFILTROS() {
    const MARCA = "MERCEDES-BENZ"
   // const chasisEnRUSOFILTRO = await RUSOFILTRO.distinct('chassis');
  
   
let data = await RUSO.find({ Brand: MARCA/*, chassis:{$nin: chasisEnRUSOFILTRO }*/}).lean();

    const responses = await Promise.all(data.map(elem => 
        axios.get(`https://www.etsp.ru/Details/OriginalCatalog.ashx?action=GetQuickDetails&code=${elem.Catalog}&vehicleId=${elem.VehicleId}&ssd=${elem.Ssd}&quickGroupId=10105&kind=0`)
            .catch(error => { console.error('Error en solicitud HTTP:', error); return null; }) 
    ));

    for (let i = 0; i < responses.length; i++) {
        let elem = data[i];
        let response = responses[i];
        if (!response || !response.data.data) continue;

        let resultados = [];

        if(response.data.data){
        for (const item of response.data.data) {
            for (const unit of item.Units) {
                for (const detail of unit.Details) {
                    if (detail.IsMatch) {
                        const nuevoElemento = {
                            UnitId:unit.UnitId,
                            Ssd:unit.Ssd,
                            idCategoria: item.CategoryId,
                            Categoria: item.Name,
                            Marca: MARCA,
                            chassis: elem.chassis,
                            Code: unit.Code,
                            idGrupo: 10105,
                            ImageUrl: unit.LargeImageUrl,
                            OEM: detail.OEM,
                            numImagen: detail.CodeOnImage,
                            cantidad: detail.Amount,
                            Descripcion: unit.Name.replace(/•\s*/, ""),
                            tipo: detail.Name.replace(/•\s*/, ""),
                        };

                        const yaExiste = resultados.some(
                            (elemento) =>
                                elemento.ImageUrl === nuevoElemento.ImageUrl &&
                                elemento.OEM === nuevoElemento.OEM
                        );

                        if (!yaExiste) {
                            resultados.push(nuevoElemento);
                        }
                    }
                }
            }
        }}


        for (const nuevoElemento of resultados) {
            console.time("Tiempo transcurrido")
            // Verificar si el elemento ya existe en RUSOFILTRO
            console.log(nuevoElemento);
            const yaExisteEnRUSOFILTRO = await RUSOFILTRO.findOne({
                ImageUrl: nuevoElemento.ImageUrl,
                chassis:nuevoElemento.chassis,
                OEM: nuevoElemento.OEM
            }).lean();

            if (!yaExisteEnRUSOFILTRO) {
               console.log("\n Registro no encontrado \n Vin: "+ nuevoElemento.chassis+" \n OEM: "+ nuevoElemento.OEM);
               // await RUSOFILTRO.insertMany([nuevoElemento]);

            }else{
                console.log("\n Registro Repetido \n Vin: "+ nuevoElemento.chassis+" \n OEM: "+ nuevoElemento.OEM);
            }
         
            console.timeEnd("Tiempo transcurrido")
        }
         
    }

    console.log("listo");
}

CONSULTARUSAFILTROS();
