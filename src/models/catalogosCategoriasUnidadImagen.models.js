const { dbImplenet } = require("../config/database");
const Schema = dbImplenet.Schema;
// Crear un esquema que acepte cualquier dato
const CatalogoCategoriaUnidadesRusoImagenSchema = new Schema(
  {},
  { strict: false }
);

module.exports = dbImplenet.model(
  "catalogosCategoriaUnidadesImagenRuso",
  CatalogoCategoriaUnidadesRusoImagenSchema,
  "catalogosCategoriaUnidadesImagenRuso"
);
