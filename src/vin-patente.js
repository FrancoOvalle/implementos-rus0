const axios = require('axios');
const PATENTE  = require('./models/patentes.model')
const ETSP_VEHICLES = require('./models/etspVehicles.model')

const datos = async () => {
    // let codigos = [null,"",0];
    // const act = await ETSP_VEHICLES.find({detalle:{$exists:false}},{"_id":0,"VIN":1})
    // act.map((e)=>{
    //     codigos.push(e.VIN)
    // })
    // console.log(codigos);
    const limit = 30; // Tamaño del lote
    const delay = 2000;
    
    let skip = 0;
    
    do {
        console.log({skip});
        const PTT = await PATENTE.find({ ANO_FABRICACION: { $gte: 2000 } }, { "_id": 0, "PLACA_PATENTE": 1 }).skip(skip).limit(limit);
    
        if (PTT.length === 0) {
            break;
        }
       
        
       

        skip += limit;
        await new Promise(resolve => setTimeout(resolve, delay));
    } while (true);
    
    
    
    // let counta = 0
    // let contador = 0;
  
    // // for(let i = 0; i < PTT.length; i+= batchSize){
    // for( let elem of PTT){
    //     contador++;
    //     console.log(elem.PLACA_PATENTE);
    //     let patente = elem.PLACA_PATENTE;
    //     const response = await axios.get(`https://www.prtpidehora.cl/buscar.php?accion=patente&patente=${patente}`,
    //     {
    //       headers: {
    //         "x-Requested-with": "XMLHttpRequest",
    //       },
    //     });
    //     console.log(response.data);


     
    //    // await ETSP_VEHICLES.insertMany(atrib);
    //     }
    //     counta ++;
    // // }
    // console.log({contador});
    // console.log({counta});
    // console.log("===== FIN ======");
}

datos()
