
const puppeteer = require('puppeteer');
let yourModule = require('./mongo.js');

function delay(time) {
	return new Promise(function(resolve) { 
		setTimeout(resolve, time)
	});
}
// remote:https://www.linkedin.com/jobs-guest/jobs/api/seeMoreJobPostings/search?currentJobId=3691620322&f_TPR=r604800&f_WT=2&keywords=software%20engineer&refresh=true&start=50
// new york:https://www.linkedin.com/jobs/search?keywords=Software%2BEngineer&location=New%2BYork%2BCity%2BMetropolitan%2BArea&geoId=90000070&f_TPR=r432000&f_PP=102571732&position=23&pageNum=0

(async () => {
	const browser = await puppeteer.launch();
	const page = await browser.newPage();
	//Retrieve amount of new job
	// await page.goto('https://www.linkedin.com/jobs/search?keywords=Software%2BEngineer&location=New%2BYork%2BCity%2BMetropolitan%2BArea&geoId=90000070&f_TPR=r432000&f_PP=102571732&position=23&pageNum=0');

	// const amountOfJob = await page.evaluate(() => {
    //     const baseCard = document.querySelector('.base-serp-page').querySelector('.base-serp-page__content').querySelector('#main-content').querySelector('.results-context-header').querySelector('.results-context-header__context').querySelector('span').innerText;
    //     return baseCard;
    // })
    // await console.log(amountOfJob);
	const amountOfJob = 900;
	let pages = await Math.floor(Number(amountOfJob)/25);
	//scrape job posting
	for (let i = 0; i < pages; i++) {
		console.log(`page: ${i}`)
		const page = await browser.newPage();
		await page.goto(`https://www.linkedin.com/jobs-guest/jobs/api/seeMoreJobPostings/search?currentJobId=3691620322&f_TPR=r604800&f_WT=2&keywords=software%20engineer&refresh=true&start=${i*25}`);

		await delay(5000);
		const quotes = await page.evaluate(() => {

			const baseList = document.querySelectorAll('li');
		
			return Array.from(baseList).flatMap((base) => {
				try {
					const baseCard = base.querySelector('.base-card');
					const link = baseCard.querySelector('a').getAttribute('href');
					const information = baseCard.querySelector('.base-search-card__info');
					const jobTitle = information.querySelector('.base-search-card__title').innerText;
					const company = information.querySelector('.base-search-card__subtitle').querySelector('a').innerText;
		
					const datetime = information.querySelector('.base-search-card__metadata').querySelector('time').getAttribute('datetime');
					const checkFor = ['senior', 'staff', 'sr', 'founding', 'data', 'machine', 'ai', 'java', 'c++', 'cloud', 'it', 
										'net','lead','manager','qa','ios', 'android','data','security','office','site','business','Solutions','mobile',
									'principal']
		
					const hasSome = checkFor.some(word => jobTitle.toLowerCase().includes(word))
					if (hasSome){
						return [];
					} else {
						return {jobTitle, link, company, datetime};
					}
				} catch {
					return [];
				}
			});
		});

		await quotes.forEach((quote) => {
			yourModule.mongodbInsert(quote.jobTitle, quote.link, quote.company, quote.datetime);
		});
	}

	await browser.close();
})();
module.exports = { delay }