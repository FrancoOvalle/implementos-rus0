const PLACA = require("./models/placa.model")
const PRT = require("./models/prtPatente.model")


const MARCA = process.env.MARCA

async function actualizaVins(){
    const ptt = await PLACA.find({
         MARCA: MARCA,
              COD_CHASIS: { $regex: /^.{0,18}$/ } 
         })
     ptt.forEach(async (e)=>{
       let vin;
 
       // Comprobar si e.vin y e.numeroChasis son no nulos y no indefinidos
       if (e.COD_CHASIS != null && e.COD_CHASIS != "NO REGISTRA" && e.COD_CHASIS != "S/N"){
        vin = e.COD_CHASIS;
        
        let vinOriginal = vin; // Guardar el vin original para comparación

// Comprobar si vin contiene caracteres no deseados
let contieneCaracteresNoDeseados = /[.*\sÑñ]/g.test(vin) || /[^a-zA-Z0-9]/g.test(vin);

// Aplicar las operaciones de reemplazo
vin = vin.replace(/[.*\s]/g, '').replace(/[^\w\d]/g, '').replace(/[Ññ]/g, '');

if (contieneCaracteresNoDeseados) {
    console.log("\n\n El VIN original contenía caracteres no deseados.");
    console.log("VIN original: " + vinOriginal);
    console.log("VIN modificado: " + vin);
}
        
           //TODO: Actualiza los vin de las colecciones 
  // await PRT.updateOne({ppu: e.ppu}, {$set: {vin: vin}});
    // await PLACA.updateOne({PLACA_PATENTE:e.PLACA_PATENTE},{$set:{COD_CHASIS:vin}})
 
}
 
   
      
     
     });
     console.log("======= FIN ========");
   }

   actualizaVins();