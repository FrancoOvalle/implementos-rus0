const request = require("request-promise");
const cheerio = require("cheerio");
const PLACA = require("./models/patentes.model")
const rutoData = require("./models/rusoData.model")
const cars = require("./models/cars.model")
const tecCat = require("./models/dataTecdoc.model")

async function CONSULTARUSAV2() {
    let ptt = await tecCat.find({marca:"SCANIA"},{modelId:1,vehicleId:1,marca:1,id_tipo:1,popupData:1,_id:0}).lean()
    let chasisArr = []
    for (let tec of ptt) {
        
       try {
        
    let modelId = tec.modeloId
    let vehicleId = tec.carId
    let id_tipo = tec.id_tipo
    let artId = tec.popupData

    const data = await request({
      uri: `https://aftermarket.catalogs-parts.com/cat_scripts/get_popup.php?lang=es&catalog=cv&word=all&ga_nr=7&ga_id=7&window_type=info&client=1&lang=es&model_id=${modelId}&typ_id=${vehicleId}&str_id=${id_tipo}&art_id=${artId}`,
       
    });
   console.log(modelId, vehicleId, id_tipo);
   // Cargar HTML en Cheerio
const $ = cheerio.load(data);
let popupDataElemento12 = []
let texto 
    $('tr').each((i, elem) => {
       let elemento12 
        // Extraer la información necesaria
        const codigo = $(elem).find('td > a').text().trim()
        const tipo = $(elem).find('td.hidden-xs').text().trim();
        $(elem).find('span[onclick^="get_popup"]').each((j, spanElem) => {
            const onclickValue = $(spanElem).attr('onclick');
    
            // Extraer los argumentos de get_popup
            const argsMatch = onclickValue.match(/get_popup\((.*?)\)/);
            if (argsMatch && argsMatch[1]) {
                const args = argsMatch[1].split(',').map(arg => arg.trim().replace(/'/g, ''));
    
                // Verificar si existe el elemento número 12
                if (args.length >= 12) {
                     elemento12 = args[12]; // El índice 11 representa el 12º elemento                    
                }
                
            }

        });
        if(codigo != ''){
            let item = {
                popupData:elemento12,
                fabricante:texto,
                marca: "SCANIA",
                codigo: codigo,
                Tipo: tipo,
                modelId: modelId,
                vehicleId:vehicleId,
                id_tipo:id_tipo
            };
            chasisArr.push(item)
        }
 
        if(codigo == ''){
            texto = $(elem).text().trim();
        }
        
    
        // Agregar al array de productos
        // productos.push({ texto,codigo, tipo,modelId, vehicleId, id_tipo, marca:"SCANIA" });
      
       
    });

    if(chasisArr.length > 50){
        await tecCat.insertMany(chasisArr)
        console.log("Guarda");
        chasisArr = []
    }

    } catch (error) {
        console.error(`CHASSIS ${error} no encontrado`);
        //TODO: update placa ... motor no encontrado 
    //  await PLACA.updateOne({_id:motorV2._id},{$set:{"catalogo":false}})
} 
}
    if(chasisArr.length > 0){
      await tecCat.insertMany(chasisArr)
        console.log("Guarda \n ==== FIN =====");
        chasisArr = []
    }
  }

  CONSULTARUSAV2();