const request = require("request-promise");
const cheerio = require("cheerio");
const PLACA = require("./models/patentes.model")
const rutoData = require("./models/rusoData.model")

async function CONSULTARUSAV2() {
    let ptt = await PLACA.find({MARCA:"SCANIA",ANO_FABRICACION:{$gte:2000},catalogo:{$exists:false},COD_MOTOR:{$regex: /^.{6,7}$/ }},{COD_MOTOR:1,COD_CHASIS:1, _id:1}).lean()
    let motores = []
    for (let motorV2 of ptt) {
        
       try {
        
     let motor = motorV2.COD_MOTOR   
    const $ = await request({
      uri: `https://zzap-hcv.laximo.online/index.php?task=vehicles&data%5BengineNo%5D=${motor}&ft=execCustomOperation&c=SCANIA202010&operation=findByEngineNumber`,
      transform: (body) => cheerio.load(body),
    });
    let hrefValue = $(
      "body > div.content-wrapper > div.vehicles-page-wrapper > div.grouped-vehicles > div > table > tbody > tr > td:nth-child(1) a"
    )
      .attr("href")
      .split("&");
   
    let Name = $(
      "body > div.content-wrapper > div.vehicles-page-wrapper > div.grouped-vehicles > div > h3"
    )
      .text()
      .replace("SCANIA", "")
      .trim();
    let item = {
      VehicleId: hrefValue[4].split("=")[1],
      Brand: "SCANIA",
      Catalog: "SCANIA202010",
      Name: Name,
      Kind: 0,
      Ssd: hrefValue[5].split("=")[1],
      motor: motor,
      tipoConsulta: "V2"
    };
    motores.push(item)
    console.log(motor);

    if(motores.length > 50){
        await rutoData.insertMany(motores)
        console.log("Guarda");
        motores = []
    }

    } catch (error) {
        console.error(`Motor ${motorV2.COD_MOTOR} no encontrado`);
        //TODO: update placa ... motor no encontrado 
        await PLACA.updateOne({_id:motorV2._id},{$set:{"catalogo":false}})
} 
}
    if(motores.length > 0){
        await rutoData.insertMany(motores)
        console.log("Guarda \n ==== FIN =====");
        motores = []
    }
  }

  CONSULTARUSAV2();