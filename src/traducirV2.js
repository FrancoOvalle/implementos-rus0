const { Translate } = require('@google-cloud/translate').v2;
// const catRuso = require('./models/catalogosCategoriasUnidad.models')
const catRusoImage = require('./models/catalogosCategoriasUnidadImagen.models')

async function traducir() {
    try {

        const projectId = 'omnichannel-247603';
        const apiKey = 'AIzaSyBUElyCvwOcbK5OetbWSx2jc2tk8Zj-nMc';
        const target = 'es';

        const translate = new Translate({ projectId: projectId, key: apiKey });
        const data = await catRusoImage.distinct("nombreUnidad")
    
        for (const item of data) {
        
            let [translations] = await translate.translate(item,target)
            
            translations = Array.isArray(translations) ? translations : [translations];
            await catRusoImage.updateMany({nombreUnidad:item},{$set:{nombreUnidad:translations[0]}})
            console.log(translations[0]);
        }
        // let [translations] = await translate.translate(text, target);

        // translations = Array.isArray(translations) ? translations : [translations];

        // translations.forEach((translation, i) => {
        //     // console.log(`${text[i]} => (${target}) ${translation}`);
        //     console.log(translation);
        //     return translation;
        // });
        // return translations[0];
        console.log('Listo');
    } catch (error) {
        console.log(error);
        return false;
    }
}
traducir();