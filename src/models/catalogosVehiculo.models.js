const { dbImplenet } = require("../config/database");
const Schema = dbImplenet.Schema;
// Crear un esquema que acepte cualquier dato
const catalogosVehiculoSchema = new Schema({}, { strict: false });

module.exports = dbImplenet.model(
  "catalogosVehiculo",
  catalogosVehiculoSchema,
  "catalogosVehiculo"
);
