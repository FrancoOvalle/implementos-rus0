const axios = require('axios');
const RUSO = require('./models/rusoData.model'); 
const RUSOFILTRO = require('./models/rusoDataFiltroV2.model'); 

// Limitar las solicitudes HTTP concurrentes
const MAX_CONCURRENT_REQUESTS = 100;
let activeRequests = 0;

async function CONSULTARUSAFILTROS() {
    const MARCA = process.env.MARCA
    console.log(MARCA);
    //const chasisEnRUSOFILTRO = await RUSOFILTRO.distinct("motor",{motor:{$exists:true}});
   

    let data = await RUSO.find({ Brand: MARCA, tipoConsulta:"V3"}).lean();
    
    let allResultados = [];
    

    for (const elem of data) {
        while (activeRequests >= MAX_CONCURRENT_REQUESTS) {
            await new Promise(resolve => setTimeout(resolve, 1000)); 
        }

        activeRequests++;
        axios.get(`https://www.etsp.ru/Details/OriginalCatalog.ashx?action=GetQuickDetails&code=${elem.Catalog}&vehicleId=${elem.VehicleId}&ssd=${elem.Ssd}&quickGroupId=10105&kind=0`)
            .then(response => {
                if(response.data.status != 'fail'){
                if (response.data.data) {
                    const resultados = processData(response.data.data, elem);
                    allResultados.push(...resultados);
                    conteo += resultados.length;

                    if (conteo >= 5000) {
                        batchInsert(allResultados);
                        allResultados = []; 
                        conteo = 0; 
                    }
                }
            }
            })
            .catch(error => console.error('Error en solicitud HTTP:', error))
            .finally(() => activeRequests--);
    }

   
    while (activeRequests > 0) {
        await new Promise(resolve => setTimeout(resolve, 1000));
    }

    
    if (allResultados.length > 0) {
        await batchInsert(allResultados);
    }
    console.log("listo");
}
let conteo = 0;
function processData(data, elem) {
    const resultados = [];
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
                            tipoConsulta:"V3",
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
    try {
        await RUSOFILTRO.insertMany(data);
        // console.log(data.length);
        console.log(`****** INSERTA ${data.length} DATOS  ******`);
    } catch (error) {
        console.error('Error en inserción de lote:', error);
    }
}

CONSULTARUSAFILTROS();
