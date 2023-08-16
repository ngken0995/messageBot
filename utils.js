
let utils={};

utils.delay=async(time)=>{
	return new Promise(function(resolve) { 
		setTimeout(resolve, time)
	});
}

utils.linkedinPeoplePage=async(page)=>{
    let url = await page.url();
    await utils.delay(10000);
    //revise url
    if (url.includes("/life")){
        url = url.split("/life")[0];
    } else if (url.includes("/job")){
        url = url.split("/life")[0];
    }
    console.log(url)
    await page.goto(url +'/people');
}


module.exports = utils;