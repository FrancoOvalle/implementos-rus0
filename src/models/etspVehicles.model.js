const { dbImplenet } = require("../config/database");
const Schema = dbImplenet.Schema;

const patente = new Schema(
  {
    VehicleId: {
        type:Number,
    },
    Brand: {
        type: String,
        },
    Catalog: {
        type: String,
        },
    Name: {
        type: String,
        },
    engine:{
        type: String,
    },
    Kind: {
        type: Number,
    },
    Ssd: {
      type: String,
    },
    VIN: {
      type: String,
    },
    detalle: {
        type:String,
    }
  }
);

module.exports = dbImplenet.model("EtspVehicles", patente,"EtspVehicles");
