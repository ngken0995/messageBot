const puppeteer = require('puppeteer');
const {getLinkedinUsername, getLinkedinPassword} = require('./envVariable.js');
let yourModule = require('./mongo.js');
function delay(time) {
	return new Promise(function(resolve) { 
		setTimeout(resolve, time)
	});
}
(async () => {
	const browser = await puppeteer.launch({headless: false});
	const page = await browser.newPage();
	await page.goto('https://www.linkedin.com');
    await delay(4000);
    //login session
    const usernameInput = await page.$("#session_key");

    await usernameInput.type(getLinkedinUsername());

    const passwordInput = await page.$("#session_password");

    await passwordInput.type(getLinkedinPassword());
    const btn = await page.$('[data-id="sign-in-form__submit-btn"]');
    await btn.click();

    await delay(20000);
    
    //look up company
    const db = await yourModule.mongodbFind();
    const lists = await db.lists.collection('listings').find();
    let link = '';
    for await (const doc of lists) {
        link = doc.link;
    }

	await page.goto(link);
    await delay(4000);
    //await page.click('img[class="ivm-view-attr__img--centered EntityPhoto-square-3   evi-image lazy-image ember-view"]');
    const companyUrl = await page.evaluate(() => {
        const baseList = document.querySelector('.jobs-unified-top-card__primary-description');

        return baseList.querySelector('a').getAttribute('href');
                
    });


    await page.goto(companyUrl);
    const url = await page.url();
    await page.goto(url +'people');

    await delay(10000);

    const searchEmployeeByCategory = await page.$('[id="people-search-keywords"]');
    await searchEmployeeByCategory.click();

    await searchEmployeeByCategory.type('recruiter');

    await page.keyboard.press('Enter');

    const data = await page.evaluate(() => {
        const tds = Array.from(document.querySelectorAll('li'))
        return tds.map(td => {
           var txt = td.innerHTML;
           return txt.replace(/<a [^>]+>[^<]*<\/a>/g, '').trim();
        });
    });
  
    
    await delay(10000);
    await page.screenshot({
        path: 'shot.jpg'
    });
    console.log(quotes)

    await db.client.close();
    await browser.close();

})();
