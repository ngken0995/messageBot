const puppeteer = require('puppeteer');


(async () => {
	const browser = await puppeteer.launch();
	const page = await browser.newPage();
    
	await page.goto("https://www.linkedin.com/jobs/search?keywords=Software%2BEngineer&location=New%2BYork%2BCity%2BMetropolitan%2BArea&geoId=90000070&f_TPR=r172800&f_PP=102571732&position=23&pageNum=0");


	await browser.close();
})();
