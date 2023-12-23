const { dbImplenet } = require("../config/database");
const Schema = dbImplenet.Schema;
// Crear un esquema que acepte cualquier dato
const CatalogoCategoriaUnidadesRusoSchema = new Schema({}, { strict: false });

module.exports = dbImplenet.model(
  "catalogosCategoriaUnidadesRuso",
  CatalogoCategoriaUnidadesRusoSchema,
  "catalogosCategoriaUnidadesRuso"
);
