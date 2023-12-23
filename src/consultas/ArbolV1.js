//db.getCollection("catalogosCategoriaRuso").find({})
db.getCollection("catalogosCategoriaRuso").distinct("ParentId", {ParentId:{$ne:""}}).forEach((e) => {
    
    let regex = new RegExp("^" + e);
 
    db.getCollection("catalogosCategoriaRuso").find({ CategoryId: regex },{_id:0,CategoryId:1, Name:1})
});