const axios = require('axios');
const PATENTE  = require('./models/patentes.model')
const ETSP_VEHICLES = require('./models/etspVehicles.model')

const datos = async () => {
    let codigos = [null,"",0];
    const act = await ETSP_VEHICLES.find({},{"_id":0,"VIN":1})
    act.map((e)=>{
        codigos.push(e.VIN)
    })
    console.log(codigos);
    const vins = await PATENTE.find({ANO_FABRICACION:{$gte:2000},COD_CHASIS:{$nin:codigos}, MARCA:"VOLVO",$expr: { $gte: [{ $strLenCP: "$COD_CHASIS" }, 15] }},{"_id":0,"COD_CHASIS":1});
    const batchSize = 30; 
    let counta = 0
    const delayBetweenBatchesMs = 2000;
    let contador = 0;
    for(let i = 0; i < vins.length; i+= batchSize){
    for( let elem of vins){
        contador++;
        console.log(elem.COD_CHASIS);
        let vin = elem.COD_CHASIS;
        const response = await axios.get(`https://www.etsp.ru/Details/OriginalCatalog.ashx?action=FindVehicleByVIN&vin=${vin}`);
        // console.log(response.data.data.Vehicles);
       
        let atrib
        // console.log(response.data);
        if(response.data.status != 'fail'){
            atrib = response.data.data.Vehicles
            if(atrib){
            atrib.forEach(item => {
                if(item.Attributes.engine){
                    item.engine = item.Attributes.engine;
                }
                if(item.Attributes.vin){
                    item.VIN = item.Attributes.vin;
                }else{
                    item.VIN = vin
                }
                delete item.Attributes;
            });
            }else{
                atrib = ({
                    VIN: vin, 
                    detalle: "data en null",
                })
            }

        }else{
            atrib = ({
                VIN: vin,
                detalle: "sin datos",
            })
        }

        console.log(atrib);
        await ETSP_VEHICLES.insertMany(atrib);
        }
        counta ++;
    }
    console.log({contador});
    console.log({counta});
    console.log("===== FIN ======");
}

datos()
