const puppeteer = require('puppeteer');
let yourModule = require('./mongo.js');

(async () => {
    //look up company
    const db = await yourModule.mongodbFind();
    const lists = await db.lists.collection('listings').find();
    //To Do: figure out how to loop through 5 unvisited companies.
    
    i = 0
    let companyList = [];
    while (i < 1) {
        for await (const doc of lists) {
            if (doc.reachedOut == false) {
                let link = doc.link;
                companyList.push(link);
                i = i  + 1;
                await db.lists.collection('listings').updateOne({'company':`${doc.company}`},{$set:{'reachedOut':true}})
            }
            
            if (i === 1) {
                break;
            }
        }
    }
    console.log(companyList)

    await db.client.close();

})();