const puppeteer = require('puppeteer');

(async () => {
	const browser = await puppeteer.launch();
	const page = await browser.newPage();
	await page.goto('https://www.linkedin.com/');
    await new Promise(function(resolve) { 
        setTimeout(resolve, 4000)
    });
    await page.screenshot({path: 'test.png'});
	await browser.close();
})();