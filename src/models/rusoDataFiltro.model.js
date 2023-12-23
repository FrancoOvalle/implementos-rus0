const { dbImplenet } = require("../config/database");
const Schema = dbImplenet.Schema;
// Crear un esquema que acepte cualquier dato
const rusoFiltroSchema = new Schema({}, { strict: false });
 
module.exports = dbImplenet.model(
  "rusoDataFiltro",
  rusoFiltroSchema,
  "rusoDataFiltro"
);
 