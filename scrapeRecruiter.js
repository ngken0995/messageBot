const puppeteer = require('puppeteer');
const {getLinkedinUsername, getLinkedinPassword} = require('./envVariable.js');
let yourModule = require('./mongo.js');
let utils = require('./utils.js')
function delay(time) {
	return new Promise(function(resolve) { 
		setTimeout(resolve, time)
	});
}



let actions={};

actions.sendMessage=async(page,companyUrl,searchName,amount)=>{
    await page.goto(companyUrl);
    const companyMission = await page.evaluate(() => {
        return document.querySelector('div.org-top-card-summary-info-list__info-item').innerText;
            
    });
    if (companyMission.toLowerCase().includes('recruiting') ||companyMission.toLowerCase().includes('consulting')){
        return;
    }
    await utils.linkedinPeoplePage(page);

    await delay(10000);
    const searchEmployee = await page.$('[id="people-search-keywords"]');
    await searchEmployee.click();

    await searchEmployee.type(searchName);

    await page.keyboard.press('Enter');

    await delay(5000);    
    
    //collect recruiter url
    const engineerUrls = await page.evaluate(() => {
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
    console.log(engineerUrls);
    let i = 0;
    for await (const url of engineerUrls) {
        if (i === amount) {
            break;
        }
        await page.goto(url.txt);

    
        const fullName = await page.evaluate(() => {
            return document.querySelector('h1').innerText;
                
        });
        console.log(fullName)
        let firstName = fullName.split(" ")[0]
        await delay(10000);

        let v = await page.$eval('div.pvs-profile-actions > button', element=> element.getAttribute("aria-label"))

        if (v.toLowerCase().includes('connect')){
            //await page.$eval('div.pvs-profile-actions > div.artdeco-dropdown', element=> element.scrollIntoView());
            await page.click('div.pvs-profile-actions > button')

        }else {
            await delay(4000);
            //await page.$eval('div.pvs-profile-actions > div.artdeco-dropdown', element=> element.scrollIntoView());
            await page.click('div.pvs-profile-actions > div.artdeco-dropdown > button');
            await delay(4000);
            await page.keyboard.press('ArrowDown');
            await page.keyboard.press('ArrowDown');
            await page.keyboard.press('ArrowDown');
            await page.keyboard.press('Enter');

            }
        await delay(4000);
        try{
            await page.waitForSelector('[aria-label="Add a note"]');
        } catch {
            break;
        }
        await page.click('[aria-label="Add a note"]')

        await delay(5000);
        if(searchName==='recruiter'){
            await page.type('[name="message"]',`Hello ${firstName},\nI\'m Kenneth Ng, a software engineer and thought you might be able to connect me with the recruiter who is responsible for a Software Engineer role.\nI consider myself to be an engineer who has the skills to succeed. Would you be open to connecting me to the right person?\nBest,\nKenneth`);
        } else {
            await page.type('[name="message"]',`Hello ${firstName},\nI recently came across your profile on LinkedIn and was amazed by your experience and background.\nWill you be available to speak with me for 10 minutes about your career path? \nThank You,\nKenneth`);
        }
        await delay(5000);

        await page.click('[aria-label="Send now"]')

        i=i+1;
    }
}

(async () => {
	const browser = await puppeteer.launch({headless: false,defaultViewport: null});
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

    while (i < 5) {
        for await (const doc of lists) {
            if (i === 5) {
                break;
            }
            if (doc.reachedOut == false) {
                let link = doc.link;
                i = i  + 1;
                await page.goto(link);
                await delay(4000);
                const companyUrl = await page.evaluate(() => {
                    const baseList = document.querySelector('.jobs-unified-top-card__primary-description');
        
                    return baseList.querySelector('a').getAttribute('href');
                            
                });
                await actions.sendMessage(page,companyUrl,'recruiter',3);
                await actions.sendMessage(page,companyUrl,'software engineer',5);
                await db.lists.collection('listings').updateOne({'company':`${doc.company}`},{$set:{'reachedOut':true}})
            }
        }
    }
    

    // for await(const jobUrl of jobLists) {
    //     await page.goto(jobUrl);
    //     await delay(4000);
    //     const companyUrl = await page.evaluate(() => {
    //         const baseList = document.querySelector('.jobs-unified-top-card__primary-description');

    //         return baseList.querySelector('a').getAttribute('href');
                    
    //     });
    //     await actions.sendMessage(page,companyUrl,'recruiter');
    //     await actions.sendMessage(page,companyUrl,'software engineer');
    // }



    
    await delay(10000);
    await page.screenshot({
        path: 'shot.jpg'
    });
    await db.client.close();
    await browser.close();

})();
