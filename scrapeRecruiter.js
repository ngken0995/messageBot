const puppeteer = require('puppeteer');
const {getUsername, getPassword} = require('./envVariable.js');
const proxy = '2.56.119.93';
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
    const usernameInput = await page.$("#session_key");

    await usernameInput.type(getUsername());

    const passwordInput = await page.$("#session_password");

    await passwordInput.type(getPassword());
    const btn = await page.$('[data-id="sign-in-form__submit-btn"]');
    await btn.click();
    await delay(30000);
    await page.screenshot({
        path: 'shot.jpg'
    });
	await browser.close();
})();
