require("./config");
const Mongoose = require("mongoose").Mongoose;

const dbImplenet = new Mongoose();

dbImplenet
    .connect(process.env.urlMongo, {
        useUnifiedTopology: true,
        useNewUrlParser: true
    })
    .then((resp) => {
        console.log("--------------------------------");
        console.log("CONEXION A MONGO [IMPLENET] ESTABLECIDA ");
    }).catch(e => {
        console.log(e);
    });




module.exports = { dbImplenet};