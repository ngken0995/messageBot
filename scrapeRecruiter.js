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
    await delay(10000);
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
    //To Do: figure out how to loop through 5 unvisited companies.
    let link = '';
    for await (const doc of lists) {
        link = doc.link;
    }

	await page.goto('https://www.linkedin.com/in/donald-rose-09415a117?miniProfileUrn=urn%3Ali%3Afs_miniProfile%3AACoAAB0IVPABzaOpTkPJzm-RetV7QMTcsqNCFsg');
    // await delay(4000);
    // const companyUrl = await page.evaluate(() => {
    //     const baseList = document.querySelector('.jobs-unified-top-card__primary-description');

    //     return baseList.querySelector('a').getAttribute('href');
                
    // });


    // await page.goto(companyUrl);
    // let url = await page.url();
    // await delay(10000);
    // //revise url
    // if (url.includes("/life")){
    //     url = url.split("/life")[0];
    // }
    // console.log(url)
    // await page.goto(url +'/people');

    // await delay(10000);

    // const searchEmployeeByCategory = await page.$('[id="people-search-keywords"]');
    // await searchEmployeeByCategory.click();

    // await searchEmployeeByCategory.type('recruiter');

    // await page.keyboard.press('Enter');

    // await delay(5000);

    // const data = await page.evaluate(() => {
    //     const tds = Array.from(document.querySelectorAll('li'))
    //     return tds.flatMap(td => {

    //         try{
    //             var txt = td.querySelector('div').querySelector('section').querySelector('div').querySelector('div').querySelector('div').querySelector('a').getAttribute('href');
    //             return {txt}
    //         } catch {
    //             return [];
    //         }
    //     });
    // });

    //connect and send message
    //let firstPerson = data[0];

    await delay(10000);
     const fullName = await page.evaluate(() => {
        return document.querySelector('h1').innerText;
                
    });
    console.log(fullName)
    // await page.waitForSelector(`[class="artdeco-button__icon"]`)
    // await page.click(`[class="artdeco-button__icon"]`)
    // const connectBtn = await page.$(`[aria-label="Invite ${fullName} to connect"]`);
    // await connectBtn.click();
    await page.click('div.pvs-profile-actions > button')
    await page.click('[aria-label="Add a note"]')


    await page.type('[name="message"]',"Hello");
    await page.click('[aria-label="Send now"]')

    
    await delay(10000);
    await page.screenshot({
        path: 'shot.jpg'
    });
    await db.client.close();
    await browser.close();

})();
