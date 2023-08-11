let yourModule = require('./mongo.js');
const puppeteer = require('puppeteer');

(async () => {
    const db = await yourModule.mongodbFind();
    const lists = await db.lists.collection('listings').find();
    let link = '';
    for await (const doc of lists) {
        link = doc.link;
    }




    console.log(link)
    await db.client.close();
})();
