const fs = require("fs");
const cheerio = require("cheerio");

// Función para extraer las coordenadas iniciales de un path
function extraerCoordenadasIniciales(d) {
  const regex = /M\s*([-\d.]+)\s*,\s*([-\d.]+)/; // Asume que el primer comando es M
  const match = d.match(regex);
  return match ? { x: parseFloat(match[1]), y: parseFloat(match[2]) } : null;
}

// Leer el archivo SVG
const svgContent = fs.readFileSync("B322037.svg", "utf8");

// Cargar el contenido con cheerio
const $ = cheerio.load(svgContent, {
  xmlMode: true,
});
let scale_x = Math.ceil(1068 / 180);
let scale_y = Math.ceil(1512 / 254.572);
console.log(scale_x);
// Extraer datos
const callouts = [];
$("g.callout").each((i, el) => {
  // Coordenadas originales
  const x1_orig = Math.ceil(
    parseFloat($(el).find("text").attr("x").replace(".", ","))
  );
  const y1_orig = Math.ceil(
    parseFloat($(el).find("text").attr("y").replace(".", ","))
  );
  // Aplicar la relación de escala
  const x1_scaled = Math.round(x1_orig * scale_x) - 11;
  const y1_scaled = Math.round(y1_orig * scale_y) - 28;
  const x2_scaled = x1_scaled + 36;
  const y2_scaled = y1_scaled + 36;

  const callout = {
    id: $(el).attr("class").split("_")[1],
    line: {
      x1: x1_scaled,
      y1: y1_scaled,
      x2: x2_scaled,
      y2: y2_scaled,
    },
  };

  // Aquí puedes hacer algo con cada objeto callout
  console.log(callout);
});

console.log(callouts);
