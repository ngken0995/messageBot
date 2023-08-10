const puppeteer = require('puppeteer');
let yourAmount={};

yourAmount.amountOfJob=async()=>{
    const browser = await puppeteer.launch();
	const page = await browser.newPage();
	await page.goto("https://www.linkedin.com/jobs/search?keywords=Software%2BEngineer&location=New%2BYork%2BCity%2BMetropolitan%2BArea&geoId=90000070&f_TPR=r86400&f_PP=102571732&currentJobId=3609228944&position=23&pageNum=0");

	const quotes = await page.evaluate(() => {
        const baseCard = document.querySelector(".base-serp-page").querySelector(".base-serp-page__content").querySelector("#main-content").querySelector(".results-context-header").querySelector(".results-context-header__context").querySelector("span").innerText;
        return baseCard;
    })
    await console.log(quotes);
    await browser.close();
    return quotes;
}

module.exports = yourAmount;