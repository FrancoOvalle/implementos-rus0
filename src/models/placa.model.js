
const { dbImplenet } = require("../config/database");
const Schema = dbImplenet.Schema;

const patente = new Schema(
  {
    PLACA_PATENTE: {
      type: String,
    },
    COD_CHASIS: {
      type: String,
    },
    NOMBRE: {
      type: String,
    },
    MARCA:{
        type:String,
    },
    MODELO:{
        type:String,
    },
    ANO_FABRICACION:{
        type:Number,
    },
    IMPtipo:{
        type:String,
    },
  }
);

module.exports = dbImplenet.model("ImplementosFiltrosPatentes", patente,"ImplementosFiltrosPatentes");
