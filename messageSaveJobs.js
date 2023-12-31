const puppeteer = require('puppeteer');
const {getLinkedinUsername, getLinkedinPassword} = require('./envVariable.js');
let utils = require('./utils.js')
function delay(time) {
	return new Promise(function(resolve) { 
		setTimeout(resolve, time)
	});
}



let actions={};
/*
Navigate through the company linkedin page,find the neccessary amount of recruiter and 
engineer, and send them a message to connect.
*/
actions.sendMessage=async(page,companyUrl,searchName,amount)=>{
    await page.goto(companyUrl);
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

        await delay(5000);
        const fullName = await page.evaluate(() => {
            return document.querySelector('h1').innerText;
                
        });
        console.log(fullName)
        let firstName = fullName.split(" ")[0]
        await delay(10000);

        let v = await page.$eval('div.pvs-profile-actions > button', element=> element.getAttribute("aria-label"))

        if (v.toLowerCase().includes('connect')){
            await page.click('div.pvs-profile-actions > button')

        }else {
            await delay(4000);
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
            await page.type('[name="message"]',`Hello ${firstName},\nI recently came across your profile on LinkedIn and was amazed by your experience and background.\nWill you be available to speak with me for 30 minutes about your career path? \nThank You,\nKenneth`);
        }
        await delay(5000);

        await page.click('[aria-label="Send now"]')

        i=i+1;
    }
}
/*
Login to linkedin, navigate to saved job page, and automate the process to message a specific
amount of recruiter and engineer. Lastly, remove the job posting and select the new populated saved job. 
*/
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
    await page.goto("https://www.linkedin.com/my-items/saved-jobs/");
    await delay(5000);

    while (await page.waitForSelector('[class="entity-result__item"]')){
        await page.click('[class="entity-result__item"]')
        await delay(5000);

        const companyUrl = await page.evaluate(() => {
            const baseList = document.querySelector('.jobs-unified-top-card__primary-description');

            return baseList.querySelector('a').getAttribute('href');
                    
        });

        await delay(5000);
        await actions.sendMessage(page,companyUrl,'recruiter',3);
        await delay(5000);

        await actions.sendMessage(page,companyUrl,'software engineer',5);
        await page.goto("https://www.linkedin.com/my-items/saved-jobs/");
        await delay(5000);
        await page.click('[class="entity-result__actions-overflow-menu-dropdown"]')
        await delay(5000);

        await page.keyboard.press('ArrowDown');
        await page.keyboard.press('ArrowDown');
        await page.keyboard.press('ArrowDown');
        await page.keyboard.press('ArrowDown');
        await page.keyboard.press('Enter');
        await delay(5000);
    }

    await delay(10000);
    await page.screenshot({
        path: 'shot.jpg'
    });
    await browser.close();

})();
