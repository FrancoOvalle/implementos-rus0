const { dbImplenet } = require("../config/database");
const Schema = dbImplenet.Schema;
// Crear un esquema que acepte cualquier dato
const CatalogoCategoriaRusoSchema = new Schema({}, { strict: false });

module.exports = dbImplenet.model(
  "catalogosCategoriaRuso",
  CatalogoCategoriaRusoSchema,
  "catalogosCategoriaRuso"
);
