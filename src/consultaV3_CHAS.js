const request = require("request-promise");
const cheerio = require("cheerio");
const PLACA = require("./models/patentes.model")
const rutoData = require("./models/rusoData.model")

async function CONSULTARUSAV2() {
    let ptt = await PLACA.find({MARCA:"SCANIA",ANO_FABRICACION:{$gte:2000},catalogo:true,COD_CHASIS:{$regex: /^.{6,7}$/ }},{COD_MOTOR:1,COD_CHASIS:1, _id:1}).lean()
    let chasisArr = []
    for (let motorV2 of ptt) {
        
       try {
        
     let chassis = motorV2.COD_CHASIS  
    const $ = await request({
      uri: `https://zzap-hcv.laximo.online/index.php?task=vehicles&data%5Bchassis%5D=${chassis}&ft=execCustomOperation&c=SCANIA202010&operation=findByChassisNumber`,
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
      Ssd: hrefValue[5].split("ssd=")[1],
      chassis: chassis,
      tipoConsulta: "V3"
    };

    chasisArr.push(item)

    console.log(chassis);

    if(chasisArr.length > 50){
       await rutoData.insertMany(chasisArr)
        console.log("Guarda");
        chasisArr = []
    }

    } catch (error) {
        console.error(`CHASSIS ${motorV2.COD_CHASIS} no encontrado`);
        //TODO: update placa ... motor no encontrado 
      await PLACA.updateOne({_id:motorV2._id},{$set:{"catalogo":false}})
} 
}
    if(chasisArr.length > 0){
      await rutoData.insertMany(chasisArr)
        console.log("Guarda \n ==== FIN =====");
        chasisArr = []
    }
  }

  CONSULTARUSAV2();