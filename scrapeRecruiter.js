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
    await delay(5000);
    //login session
    const usernameInput = await page.$("#session_key");

    await usernameInput.type(getLinkedinUsername());

    const passwordInput = await page.$("#session_password");

    await passwordInput.type(getLinkedinPassword());
    const btn = await page.$('[data-id="sign-in-form__submit-btn"]');
    await btn.click();

    await delay(15000);
    
    //look up company
    const db = await yourModule.mongodbFind();
    const lists = await db.lists.collection('listings').find();
    //To Do: figure out how to loop through 5 unvisited companies.
    
    i = 0
    let jobLists = [];
 
    while (i < 1) {
        for await (const doc of lists) {
            if (doc.reachedOut == false) {
                let link = doc.link;
                jobLists.push(link);
                i = i  + 1;
                await db.lists.collection('listings').updateOne({'company':`${doc.company}`},{$set:{'reachedOut':true}})
            }
            
            if (i === 1) {
                break;
            }
        }
    }
      

    for await(const jobUrl of jobLists) {
        await page.goto(jobUrl);
        await delay(4000);
        const companyUrl = await page.evaluate(() => {
            const baseList = document.querySelector('.jobs-unified-top-card__primary-description');

            return baseList.querySelector('a').getAttribute('href');
                    
        });

        await page.goto(companyUrl);
        let url = await page.url();
        await delay(10000);
        //revise url
        if (url.includes("/life")){
            url = url.split("/life")[0];
        }
        console.log(url)
        await page.goto(url +'/people');

        await delay(10000);

        const searchEmployeeByCategory = await page.$('[id="people-search-keywords"]');
        await searchEmployeeByCategory.click();
    
        await searchEmployeeByCategory.type('recruiter');
    
        await page.keyboard.press('Enter');
    
        await delay(5000);    
        
        //collect recruiter url
        const recruiterUrls = await page.evaluate(() => {
            const tds = Array.from(document.querySelectorAll('li'))
            return tds.flatMap(td => {

                try{
                    var txt = td.querySelector('div').querySelector('section').querySelector('div').querySelector('div').querySelector('div').querySelector('a').getAttribute('href');
                    return {txt}
                } catch {
                    return [];
                }
                });
        });

        //connect and send message

        await delay(5000);
        console.log(recruiterUrls);
        for await (const url of recruiterUrls) {
            await page.goto(url.txt);

        
        const fullName = await page.evaluate(() => {
            return document.querySelector('h1').innerText;
                
        });
        console.log(fullName)
        await delay(10000);

        let v = await page.$eval('div.pvs-profile-actions > button', element=> element.getAttribute("aria-label"))

        if (v.toLowerCase().includes('follow')){
            //await page.$eval('div.pvs-profile-actions > div.artdeco-dropdown', element=> element.scrollIntoView());
            await page.keyboard.press('ArrowDown');
            await page.keyboard.press('ArrowDown');
            await page.keyboard.press('ArrowDown');
            await page.keyboard.press('ArrowDown');
            await page.click('div.pvs-profile-actions > div.artdeco-dropdown');

            await delay(5000);
            // let b = await page.$eval('div.pvs-profile-actions> div.artdeco-dropdown > div > div > ul > li > div)', element=> element.getAttribute("aria-label"))
            // console.log(b)

            // await page.$$eval('a.cls-context-menu-link', links => links.forEach(link => link.click()))
            const elements = await page.$$(`div[aria-label="Invite ${fullName} to connect"]`);
            for await (const element of elements) {
                await delay(5000);
                await page.click('div.pvs-profile-actions > div.artdeco-dropdown');
                await delay(5000);

                await element.click();
            }
        }else {
                await page.click('div.pvs-profile-actions > button')

            }
        await page.click('[aria-label="Add a note"]')

        await delay(5000);

        await page.type('[name="message"]',`Hello ${fullName},\nI\'m Kenneth Ng, a software engineer who saw your profile on LinkedIn and thought you might be an ally in connecting me with the recruiter who is responsible for this Software Engineer.\nI consider myself to be an engineer who has the skills to succeed. Would you be open to helping my application get considered by connecting me to the right person?\nBest,\nKenneth
        `);
        await delay(5000);

        await page.click('[aria-label="Send now"]')
        }
    }



    
    await delay(10000);
    await page.screenshot({
        path: 'shot.jpg'
    });
    await db.client.close();
    await browser.close();

})();
