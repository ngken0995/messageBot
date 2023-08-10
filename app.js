
const puppeteer = require('puppeteer');
const {getJobSearchUrl} = require('./env_variable.js');
let yourModule = require('./mongo.js');

(async () => {
	const browser = await puppeteer.launch();
	const page = await browser.newPage();
	
	await page.goto(getJobSearchUrl());

	const quotes = await page.evaluate(() => {
		// Fetch the first element with class "quote"
		const baseList = document.querySelectorAll("li");
	
		// Fetch the sub-elements from the previously fetched quote element
		// Get the displayed text and return it (`.innerText`)
		return Array.from(baseList).flatMap((base) => {
			const baseCard = base.querySelector(".base-card");
			const link = baseCard.querySelector('a').getAttribute('href');
			const information = baseCard.querySelector(".base-search-card__info");
			const jobTitle = information.querySelector(".base-search-card__title").innerText;
			const company = information.querySelector(".base-search-card__subtitle").querySelector("a").innerText;

			const datetime = information.querySelector(".base-search-card__metadata").querySelector('time').getAttribute('datetime');
			const checkFor = ["senior", "staff", "sr", "founding", "data", "machine", "ai", "java", "c++", "cloud", "it", 
								"net","lead","manager"]

			const hasSome = checkFor.some(word => jobTitle.toLowerCase().includes(word))
			if (hasSome){
				return [];
			} else {
				return {jobTitle, link, company, datetime};
			}
		});
	});

	await quotes.forEach((quote) => {
		yourModule.mongodbInsert(quote.jobTitle, quote.link, quote.company, quote.datetime);
	});
	  // Display the quotes
	await console.log(quotes);

	await browser.close();
})();
