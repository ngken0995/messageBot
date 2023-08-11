let yourModule = require('./mongo.js');
const puppeteer = require('puppeteer');
const {delay} = require('./scrapeJob.js');
(async () => {
    const db = await yourModule.mongodbFind();
    const lists = await db.lists.collection('listings').find();
    let link = '';
    for await (const doc of lists) {
        link = doc.link;
    }

    const browser = await puppeteer.launch({headless:false});
	const page = await browser.newPage();

	await page.goto(link);
    await delay(4000);
    
    const btn = await page.$('[class="app-aware-link "]');
    await btn.click();
    
    await db.client.close();
    await browser.close();
})();
