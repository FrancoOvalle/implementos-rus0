const axios = require("axios");
const PLACA = require("./models/placa.model")
const PRT = require("./models/prtPatente.model")
const RUSO = require("./models/rusoData.model")
const RUSOFILTRO = require("./models/rusoDataFiltro.model")

const MARCA = process.env.MARCA
const completado = []

async function CONSULTAPRT() {
    let data = await PLACA.find(
      {
        MARCA: "MITSUBISHI",
        ANO_FABRICACION: { $gte: 2000 },
        $or: [
          { COD_CHASIS: { $eq: null } },
          { COD_CHASIS: { $regex: /^.{0,16}$/ } },
        ],
      },
      { _id: 0, PLACA_PATENTE: 1, COD_CHASIS: 1 }
    );
  
    let promesas = [];
    let datos = [];
  
    for (let elem of data) {
      const promise = axios.get(
        `https://prtpidehora.cl/buscar.php?accion=patente&patente=${elem.PLACA_PATENTE}`,
        {
          headers: { "x-requested-with": "XMLHttpRequest" },
        }
      );
  
      promesas.push(promise);
  
      if (promesas.length === 10) {
        const resultados = await Promise.all(promesas);
        for (let response of resultados) {
          if (response.data.ppu) {
            datos.push(response.data);
          }
        }
  
        if (datos.length > 50) {
          console.log("guarda");
          await PRT.insertMany(datos);
          datos = [];
        }
  
        promesas = [];
      }
    }
  
    // Procesar el último lote
    if (promesas.length > 0) {
      const resultados = await Promise.all(promesas);
      for (let response of resultados) {
        if (response.data.ppu) {
          datos.push(response.data);
        }
      }
    }
  
    if (datos.length > 0) {
      await PRT.insertMany(datos);
    }
    console.log("======== FIN =========");
  }
  

  async function actualizaVins(){
   const ptt = await PRT.find({
        marca: MARCA,
        $or: [
            { numeroChasis: { $regex: /^.{16,}$/ } },
            { vin: { $regex: /^.{16,}$/ } }
        ]
    })
    ptt.forEach(async (e)=>{
      let vin;

      // Comprobar si e.vin y e.numeroChasis son no nulos y no indefinidos
      if (e.vin != null && e.numeroChasis != null) {
          if (e.numeroChasis === e.vin) {
              vin = e.numeroChasis;
          } else if (e.vin.length > 15) {
              vin = e.vin;
          } else if (e.numeroChasis.length > 15) {
              vin = e.numeroChasis;
          } else {
              console.log("Sin vin ni chasis compatible\n");
              return;
          }
      } else if (e.vin != null && e.vin.length > 15) {
          // Solo e.vin es no nulo y su longitud es mayor que 15
          vin = e.vin;
      } else if (e.numeroChasis != null && e.numeroChasis.length > 15) {
          // Solo e.numeroChasis es no nulo y su longitud es mayor que 15
          vin = e.numeroChasis;
      } else {
          console.log("Sin vin ni chasis compatible\n");
          return;
      }
      
        if(vin != undefined ){
          
       
        // vin = vin.replace(/[^\w\dÑñ]/g, '');
        vin = vin.replace(/[.*\s]/g, '').replace(/[^\w\d]/g, '').replace(/[Ññ]/g, '');

    
        console.log(" \n\n patente : "+ e.ppu+
                "\n nro chasis: "+e.numeroChasis+
                "\n vin: "+e.vin+
                "\n VIN: "+vin) 

          //TODO: Actualiza los vin de las colecciones 
 // await PRT.updateOne({ppu: e.ppu}, {$set: {vin: vin}});
    await PLACA.updateOne({PLACA_PATENTE:e.ppu},{$set:{COD_CHASIS:vin}})

        }else{
          console.error(`vin es undefined para la patente ${e.ppu}, el vin era ${e.vin}, el chasis ${e.numeroChasis}`);
         
        }

  
     
    
    });
    console.log("======= FIN ========");
  }

  async function CONSULTARUSA() {
    //no incluir codigos 
     let daVin =  await RUSO.distinct("chassis")
    daVin.forEach((x)=>{
        completado.push(x)
    })
   
    console.log(completado);
    let data = await PLACA.find(
      {
        MARCA: MARCA,
        $and:[ {COD_CHASIS: {$nin:completado}},
            {COD_CHASIS: { $regex: /^.{16,}$/ }}],
        ANO_FABRICACION: { $gte: 2000 },
        
      },
      { _id: 0, PLACA_PATENTE: 1, COD_CHASIS: 1 }
    );
  
    let promesas = [];
    let datos = [];
  
    for (let elem of data) {
      const promise = axios.get(
        `https://www.etsp.ru/Details/OriginalCatalog.ashx?action=FindVehicleByVIN&vin=${elem.COD_CHASIS}`
      );
  
      promesas.push(promise);
  
      if (promesas.length === 10) {
        const resultados = await Promise.all(promesas);
        for (let response of resultados) {
          if (response.data.data && response.data.data.Vehicles) {
            let vin = response.config.url.split("vin=")[1];
            delete response.data.data.Vehicles[0].Attributes;
            response.data.data.Vehicles[0].chassis = vin;
            console.log(response.data.data.Vehicles[0]);
            datos.push(response.data.data.Vehicles[0]);
          } else {
            console.log("No: " + response.config.url.split("vin=")[1]);
          }
        }
  
        if (datos.length > 50) {
          console.log("guarda");
          await RUSO.insertMany(datos);
          datos = [];
        }
  
        promesas = [];
      }
    }
  
    // Procesar el último lote
    if (promesas.length > 0) {
      const resultados = await Promise.all(promesas);
      for (let response of resultados) {
        if (response.data.data && response.data.data.Vehicles) {

          let vin = response.config.url.split("vin=")[1];
          delete response.data.data.Vehicles[0].Attributes;
          response.data.data.Vehicles[0].chassis = vin;
          datos.push(response.data.data.Vehicles[0]);
        }
      }
      promesas = [];
    }
  
    if (datos.length > 0) {
      await RUSO.insertMany(datos);
    }
    console.log("Terminado");
  }
  


  async function CONSULTARUSAREPUESTOS() {
    let data = await RUSO.find({}).lean();
  
    for (let elem of data) {
      let resultados = [];
  
      const response2 = await axios.get(
        `https://www.etsp.ru/Details/OriginalCatalog.ashx?action=GetQuickGroups&code=${elem.Catalog}&vehicleId=${elem.VehicleId}&ssd=${elem.Ssd}&kind=0`
      );
  
      const idsConLinkTrue = obtenerQuickGroupIdsConLinkTrue(response2.data.data);
  
      for (let elemCategoria of idsConLinkTrue) {
        const response = await axios.get(
          `https://www.etsp.ru/Details/OriginalCatalog.ashx?action=GetQuickDetails&code=${elem.Catalog}&vehicleId=${elem.VehicleId}&ssd=${elem.Ssd}&quickGroupId=${elemCategoria}&kind=0`
        );
        for (const item of response.data.data) {
          for (const unit of item.Units) {
            for (const detail of unit.Details) {
              if (detail.IsMatch) {
                const nuevoElemento = {
                  chassis: elem.chassis,
                  categoria: elemCategoria,
                  ImageUrl: unit.LargeImageUrl,
                  OEM: detail.OEM,
                  numImagen: detail.CodeOnImage,
                  cantidad: detail.Amount,
                  Descripcion: unit.Name.replace(/•\s*/, ""),
                  tipo: detail.Name.replace(/•\s*/, ""),
                };
  
                // Verificar si el elemento ya existe en el array
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
        await RUSOFILTRO.insertMany(resultados);
      }
    }
  
    console.log("listo");
  }

  async function CONSULTARUSAFILTROSCOORDENADAS() {
    let data = await RUSOFILTRO.aggregate([
      {
        $match: { Marca: "SCANIA", tipoConsulta: "V3" },
      },
      {
        $group: {
          _id: { UnitId: "$UnitId", ImageUrl: "$ImageUrl" },
          firstSsd: { $first: "$Ssd" },
        },
      },
      {
        $project: {
          _id: 0,
          UnitId: "$_id.UnitId",
          ImageUrl: "$_id.ImageUrl",
          Ssd: "$firstSsd",
        },
      },
    ]);
  
    let contador = 0;
    let total = data.length;
    for (let elem of data) {
      const response = await axios.get(
        `https://www.etsp.ru/Details/OriginalCatalog.ashx?action=GetUnit&code=SCANIA202010&unitId=${elem.UnitId}&ssd=${elem.Ssd}&kind=0`
      );
  
      let coordenadas = response.data.data.ImageMap;
      if (coordenadas) {
        let bulkOps = [];
  
        for (let item of coordenadas) {
          bulkOps.push({
            updateMany: {
              filter: {
                UnitId: elem.UnitId,
                ImageUrl: elem.ImageUrl,
                numImagen: item.Code,
              },
              update: { $set: { coordenadas: item } },
            },
          });
        }
  
        if (bulkOps.length > 0) {
          await RUSOFILTRO.bulkWrite(bulkOps);
        }
      }
      contador++;
      console.log(contador + " de " + total);
    }
  
    console.log("listo");
  }
  
  async function CONSULTARUSAFILTROS() {

    let data = await RUSO.find({ Brand:MARCA }).lean();
  
    for (let elem of data) {
      let resultados = [];
  
      const response = await axios.get(
        `https://www.etsp.ru/Details/OriginalCatalog.ashx?action=GetQuickDetails&code=${elem.Catalog}&vehicleId=${elem.VehicleId}&ssd=${elem.Ssd}&quickGroupId=10105&kind=0`
      );
      for (const item of response.data.data) {
        for (const unit of item.Units) {
          for (const detail of unit.Details) {
            if (detail.IsMatch) {
              const nuevoElemento = {
                idCategoria: item.CategoryId,
                Categoria: item.Name,
                Marca:MARCA,
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
  
              // Verificar si el elemento ya existe en el array
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
      console.log(elem.chassis);
      console.log(resultados);
     await RUSOFILTRO.insertMany(resultados);
    }
  
    console.log("listo");
  }


  CONSULTAPRT();
       //  actualizaVins();
  //  CONSULTARUSA();
    //CONSULTARUSAFILTROS();
    