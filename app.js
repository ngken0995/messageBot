
const puppeteer = require('puppeteer');
const {getJobSearchUrl} = require('./env_variable.js');
let yourModule = require('./mongo.js');

(async () => {
	const browser = await puppeteer.launch();
	const page = await browser.newPage();
	// await page.goto('https://www.linkedin.com/');

    // await login(page);

	// const jobSearchLink = await getJobSearchUrl()
	// await page.goto(jobSearchLink);

    // await new Promise(function(resolve) { 
    //     setTimeout(resolve, 10000)
    // });
    // await page.screenshot({path: 'search.png'});
	
	await page.goto(getJobSearchUrl());

	const quotes = await page.evaluate(() => {
		// Fetch the first element with class "quote"
		const baseList = document.querySelectorAll("li");
	
		// Fetch the sub-elements from the previously fetched quote element
		// Get the displayed text and return it (`.innerText`)
		return Array.from(baseList).map((base) => {
			const baseCard = base.querySelector(".base-card");
			const link = baseCard.querySelector('a').getAttribute('href');
			const information = baseCard.querySelector(".base-search-card__info");
			const jobTitle = information.querySelector(".base-search-card__title").innerText;
			const company = information.querySelector(".base-search-card__subtitle").querySelector("a").innerText;

			const datetime = information.querySelector(".base-search-card__metadata").querySelector('time').getAttribute('datetime');


			return {jobTitle, link, company, datetime};
		});
	  });

	await quotes.forEach((quote) => {
		yourModule.mongodbInsert(quote.jobTitle, quote.link, quote.company, quote.datetime);
	});
	  // Display the quotes
	  console.log(quotes);

	await browser.close();
})();
