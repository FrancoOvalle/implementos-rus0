const axios = require('axios');
const RUSO = require('./models/rusoData.model'); 
const RUSOFILTRO = require('./models/rusoDataFiltroV2.model'); 

// Limitar las solicitudes HTTP concurrentes
const MAX_CONCURRENT_REQUESTS = 100;
let activeRequests = 0;

async function CONSULTARUSAFILTROS() {
    const MARCA = "VOLVO";
    const chasisEnRUSOFILTRO = await RUSOFILTRO.distinct('chassis');
    let data = await RUSO.find({ Brand: MARCA, chassis: { $nin: chasisEnRUSOFILTRO }}).lean();

    const allResultados = [];

    for (const elem of data) {
        while (activeRequests >= MAX_CONCURRENT_REQUESTS) {
            await new Promise(resolve => setTimeout(resolve, 1000)); // Esperar 1 segundo
        }

        activeRequests++;
        axios.get(`https://www.etsp.ru/Details/OriginalCatalog.ashx?action=GetQuickDetails&code=${elem.Catalog}&vehicleId=${elem.VehicleId}&ssd=${elem.Ssd}&quickGroupId=10105&kind=0`)
            .then(response => {
                if (response.data.data) {
                    const resultados = processData(response.data.data, elem);
                    allResultados.push(...resultados);
                }
            })
            .catch(error => console.error('Error en solicitud HTTP:', error))
            .finally(() => activeRequests--);
    }

    // Espera a que todas las solicitudes se completen
    while (activeRequests > 0) {
        await new Promise(resolve => setTimeout(resolve, 1000));
    }

    // Inserciones en lote
    await batchInsert(allResultados);
    console.log("listo");
}
let conteo = 0
function processData(data, elem) {
    const resultados = [];
    
    // console.log({data});
    // console.log({elem});
    // console.time("dato ")
    if(data){
    for (const item of data) {
        for (const unit of item.Units) {
            for (const detail of unit.Details) {
                if (detail.IsMatch) {
                    const nuevoElemento = {
                        UnitId:unit.UnitId,
                        Ssd:unit.Ssd,
                        idCategoria: item.CategoryId,
                        Categoria: item.Name,
                        Marca: elem.Brand,
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
    }
    
}
// console.timeEnd("dato ")
    // console.log({resultados});
  conteo++
  console.log({conteo});
  return resultados;
}

async function batchInsert(data) {
    const batchSize = 500; // Ajusta este valor según tu entorno
    for (let i = 0; i < data.length; i += batchSize) {
        const batch = data.slice(i, i + batchSize);
        try {
            await RUSOFILTRO.insertMany(batch);
        } catch (error) {
            console.error('Error en inserción de lote:', error);
        }
    }
}

CONSULTARUSAFILTROS();
