const { dbImplenet } = require("../config/database");
const Schema = dbImplenet.Schema;
// Crear un esquema que acepte cualquier dato
const prtSchema = new Schema({}, { strict: false });
 
module.exports = dbImplenet.model("tecdocCatalog", prtSchema, "tecdocCatalog");