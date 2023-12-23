const catRuso = require('./models/catalogosCategorias.models')
const { translate } = require('@vitalets/google-translate-api');

const CatRu = async () => {
    const data = await catRuso.distinct("Name")
    // console.log(data);
    for (const item of data) {
        try {
            const res = await translate(item, { from: 'ru', to: 'es' });
            console.log(res.text);
        } catch (error) {
            console.log(error);
            return false;
        }
    }
}


CatRu()