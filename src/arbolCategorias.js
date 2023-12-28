const catalogCategoria = require('./models/catalogosCategorias.models')
const catUnidadRuso = require('./models/catalogosCategoriasUnidad.models')

const arbol = async () => {
    const data = await catalogCategoria.distinct("ParentId", {ParentId:{$ne:""}})

    let arbolCompleto = []
    for (const item of data) {
        let arbol = {}
        let regex = new RegExp("^" + item);
        const arb = await catalogCategoria.find({CategoryId: regex},{_id:0,CategoryId:1, Name:1})
        // console.log(arb);
        arbol = {
            parent:item,
            categoria:arb
        }
        arbolCompleto.push(arbol)  
        console.log(arbol);
    }
    
    console.log(arbolCompleto);

}

arbol();