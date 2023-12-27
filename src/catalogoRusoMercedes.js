const CATALOGORUSOMERCEDES = require("./models/catalogoRusoMercedes.model");
const CATALOGOCATEGORIARUSOMERCEDES = require("./models/catalogosCategoriaRusoMercedes.model");
const CATALOGOCATEGORIUNIDADRUSMERCEDES = require("./models/catalogoCategoriaUnidadMercedes.model");
const CATALOGOCATEGORIUNIDADIMAGENRUSO = require("./models/catalogosCategoriasUnidadImagen.models");
const CATALOGOVEHICULO = require("./models/catalogosVehiculo.models");
const RUSO = require("./models/rusoData.model");
const axios = require("axios");
[
  //"DAF", NO
  "HYUNDAI_CV",
  "ISUZUCV201702",
  "IVECO202001",
  "IVECO",
  "KIA_CV",
  "MAN201908",
  "MBC201810",
  "RCV201910",
  //"SCANIA202010",
  //"VCV201606", NO
];

const BATCH_SIZE = 5000;

async function modelosMarcas(catalogo) {
  const response = await axios.get(
    `https://www.etsp.ru/Details/OriginalCatalog.ashx?action=GetWizard2&kind=0&code=${catalogo}`
  );

  await versionesModelos(catalogo, response.data.data.options);
}

async function versionesModelos(catalogo, modelos) {
  let arrayVersion = [];
  for (let item of modelos) {
    const response = await axios.get(
      `https://www.etsp.ru/Details/OriginalCatalog.ashx?action=GetWizard2AdditionalOptions&kind=0&code=${catalogo}&ssd=${item.key}`
    );
    let datosVersion = response.data.data[0].options;
    for (let el of datosVersion) {
      let registro = {
        marca: "SCANIA",
        modelo: item.value,
        catalogoId: catalogo,
        version: el.value,
        keyVersion: el.key,
        ssd: "",
        nombre: "",
        VehicleId: 0,
      };
      arrayVersion.push(registro);
    }
  }
  let respuesta = [];
  for (let elem of arrayVersion) {
    const response = await axios.get(
      `https://www.etsp.ru/Details/OriginalCatalog.ashx?action=FindVehicleByWizard2&kind=0&code=${elem.catalogoId}&ssd=${elem.keyVersion}`
    );
    elem.ssd = response.data.data.Vehicles[0].Ssd;
    elem.VehicleId = response.data.data.Vehicles[0].VehicleId;
    elem.nombre = response.data.data.Vehicles[0].Name;
    respuesta.push(elem);
  }
  await CATALOGORUSO.insertMany(respuesta);
  console.log("LISTO");
}

async function catalogoCategorias() {
    let ingresadas = await CATALOGOCATEGORIARUSOMERCEDES.distinct("VehicleId")

  let data = await CATALOGORUSOMERCEDES.find({VehicleId:{$nin:ingresadas}}).lean();

  for (let item of data) {
    const response = await axios.get(
      `https://www.etsp.ru/Details/OriginalCatalog.ashx?action=GetCategories&code=${item.catalogoId}&vehicleId=${item.VehicleId}&ssd=${item.ssd}&kind=0`
    );
    let respuesta = [];
    let categorie = response.data.data.Categories;
    for (let elem of categorie) {
      let catego = {
        catalogoId: item.catalogoId,
        VehicleId: item.VehicleId,
        CategoryId: elem.CategoryId,
        Name: elem.Name,
        ParentId: elem.ParentId,
        ssd: elem.Ssd,
      };
      respuesta.push(catego);
    }
    await CATALOGOCATEGORIARUSOMERCEDES.insertMany(respuesta);
    // console.log({respuesta});
    console.log("vehiculo: " + item.VehicleId);
  }
  console.log("LISTO");
}

async function catalogoCategoriasUnidades() {
    try {
        let totalDocs = await CATALOGOCATEGORIARUSOMERCEDES.countDocuments();
        let processed = 0;

        while (processed < totalDocs) {
            let data = await CATALOGOCATEGORIARUSOMERCEDES.find({})
                .skip(processed)
                .limit(BATCH_SIZE)
                .lean();

            for (let item of data) {
                try {
                    let response = await axios.get(`https://www.etsp.ru/Details/OriginalCatalog.ashx?action=GetUnits&code=${item.catalogoId}&vehicleId=${item.VehicleId}&ssd=${item.ssd}&categoryId=${item.CategoryId}&kind=0`);

                    let unidades = response.data.data.Units;
                    if (unidades) {
                        let resultado = [];
                        for (let el of unidades) {
                            let unit = {
                                catalogoId: "MBC201810",
                                VehicleId: item.VehicleId,
                                CategoryId: item.CategoryId,
                                NameCategorie: item.Name,
                                UnitId: el.UnitId,
                                ImageUrl: el.ImageUrl,
                                NameUnit: el.Name,
                                Code: el.Code,
                                ssd: el.Ssd,
                            };
                            resultado.push(unit);
                        }
                        // Aquí puedes hacer algo con 'resultado', como insertarlo en la base de datos
                        await CATALOGOCATEGORIUNIDADRUSMERCEDES.insertMany(resultado);
                        console.log(`Guarda VehicleID: ${resultado[0].VehicleId},CategoryId: ${resultado[0].CategoryId},UnitID: ${resultado[0].UnitId} `);
                        //console.log(resultado);
                        
                    }
                } catch (error) {
                    console.error(`Error al procesar el item con VehicleId ${item.VehicleId}:`, error);
                }
            }

            processed += data.length;
        }
        console.log("LISTO");
    } catch (error) {
        console.log("Error en la función principal:", error);
    }
}

// async function catalogoCategoriasUnidades() {
//     try {
//         //TODO: Agregar los que ya fueron ingresados 
//         let totalDocs = await CATALOGOCATEGORIARUSOMERCEDES.countDocuments();
//         let processed = 0;
//         // console.log(totalDocs);
//         while (processed < totalDocs) {
//             let data = await CATALOGOCATEGORIARUSOMERCEDES.find({})
//                 .skip(processed)
//                 .limit(BATCH_SIZE)
//                 .lean();
        
//         // console.log(data);
//         // for (let item of data) {
//         //   const response = await axios.get(
//         //     `https://www.etsp.ru/Details/OriginalCatalog.ashx?action=GetUnits&code=${item.catalogoId}&vehicleId=${item.VehicleId}&ssd=${item.ssd}&categoryId=${item.CategoryId}&kind=0`
//         //   );

//         //   let unidades = response.data.data.Units;
//         //   if (unidades) {

//         let requests = data.map(item => axios.get(`https://www.etsp.ru/Details/OriginalCatalog.ashx?action=GetUnits&code=${item.catalogoId}&vehicleId=${item.VehicleId}&ssd=${item.ssd}&categoryId=${item.CategoryId}&kind=0`));
//         let responses = await Promise.allSettled(requests);

//         for (let response of responses) {
//             if (response.status === 'fulfilled') {
//                 let unidades = response.value.data.data.Units;
//                 if (unidades) {
//             let resultado = [];
//             for (let el of unidades) {

//               let unit = {
//                 catalogoId: "MBC201810",
//                 VehicleId: item.VehicleId,
//                 CategoryId: item.CategoryId,
//                 NameCategorie: item.Name,
//                 UnitId: el.UnitId,
//                 ImageUrl: el.ImageUrl,
//                 NameUnit: el.Name,
//                 Code: el.Code,
//                 ssd: el.Ssd,
//               };
//               resultado.push(unit);
//             }
             
//               console.log(resultado);
//             }
//           }
//           console.log(item.VehicleId);
//           processed += data.length;
//         }
//         console.log("LISTO");
//         }
//     } catch (error) {
//         console.log(error);
//     }
 
// }

async function catalogoCategoriasUnidadesImagen() {
  let listos = await CATALOGOCATEGORIUNIDADIMAGENRUSO.distinct("UnitId");

  let data = await CATALOGOCATEGORIUNIDADRUSO.aggregate([
    { $match: { UnitId: { $nin: listos } } },
    {
      $group: {
        _id: {
          UnitId: "$UnitId",
          ImageUrl: "$ImageUrl",
          Code: "$Code",
        },
        ssd: { $first: "$ssd" },
      },
    },
    {
      $project: {
        _id: 0,
        UnitId: "$_id.UnitId",
        ImageUrl: "$_id.ImageUrl",
        Code: "$_id.Code",
        ssd: "$ssd",
      },
    },
  ]);

  const LOTE_TAMANO = 20;
  for (let i = 0; i < data.length; i += LOTE_TAMANO) {
    const lote = data.slice(i, i + LOTE_TAMANO);
    const resultadosLote = await procesarLote(lote);
    await CATALOGOCATEGORIUNIDADIMAGENRUSO.insertMany(resultadosLote.flat());
  }
}
async function procesarLote(lote) {
  const promesas = lote.map(async (item) => {
    const response = await axios.get(
      `https://www.etsp.ru/Details/OriginalCatalog.ashx?action=GetUnit&code=SCANIA202010&unitId=${item.UnitId}&ssd=${item.ssd}&kind=0`
    );
    let unidades = response.data.data.UnitDetails;
    let ImageMap = response.data.data.ImageMap;
    let nombreUnidad = response.data.data.UnitInfo.Name;
    let imagenUrl = response.data.data.UnitInfo.ImageUrl;
    let resultado = [];
    console.log(item.UnitId);
    if (unidades) {
      for (let elem of unidades) {
        let pieza = {
          catalogoId: "SCANIA202010",
          nombreUnidad: nombreUnidad,
          imagenUrl: imagenUrl,
          UnitId: item.UnitId,
          code: item.Code,
          codigo: elem.CodeOnImage,
          nombre: elem.Name,
          OEM: elem.OEM,
          cantidad: elem.Amount,
          coordenadad: ImageMap
            ? ImageMap.filter((x) => x.Code == elem.CodeOnImage)
            : [],
        };
        resultado.push(pieza);
      }
      return resultado;
    }
  });

  return Promise.all(promesas);
}

async function vehiculoCategeria2() {
    let codigos = await CATALOGOVEHICULO.distinct("VehicleId");
  let data = await RUSO.find({ Brand: "SCANIA", VehicleId:{$nin:codigos} }).lean();
  console.log({data});
    try {
        
   
  for (let elem of data) {
    let resultado = [];
    const response = await axios.get(
      `https://www.etsp.ru/Details/OriginalCatalog.ashx?action=GetCategories&code=SCANIA202010&vehicleId=${elem.VehicleId}&ssd=${elem.Ssd}&kind=0`
    );
    let categorie = response.data.data.Categories;
    let categorieFilter = categorie.filter((x) => x.ParentId == "");
    const promesas = categorieFilter.map((item) =>
      axios.get(
        `https://www.etsp.ru/Details/OriginalCatalog.ashx?action=GetUnits&code=SCANIA202010&vehicleId=${elem.VehicleId}&ssd=${item.Ssd}&categoryId=${item.CategoryId}&kind=0`
      )
    );
    const respuestas = await Promise.all(promesas);
    for (const response2 of respuestas) {
      let unidades = response2.data.data.Units;
      if (unidades) {
        for (let el of unidades) {
          let unit = {
            catalogoId: "SCANIA202010",
            VehicleId: elem.VehicleId,
            UnitId: el.UnitId,
            Code: el.Code,
          };
          resultado.push(unit);
        }
      }
    }

    await CATALOGOVEHICULO.insertMany(resultado);
    console.log(elem.VehicleId);
  } } catch (error) {
        console.log(error);
    }

  console.log("listo");
}

// vehiculoCategeria2();
// catalogoCategorias();
catalogoCategoriasUnidades();
//catalogoCategoriasUnidadesImagen();
//modelosMarcas("HYUNDAI_CV");
