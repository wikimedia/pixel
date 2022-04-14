const loginReload = async ( page, scenario ) => {
	const INPUT_SELECTOR = 'input[name="wpName"]';
	await page.goto( scenario.loginUrl );
	await page.waitForSelector( INPUT_SELECTOR );
	await page.type( INPUT_SELECTOR, scenario.username );
	await page.type( 'input[name="wpPassword"]', scenario.password );

	// waitForNavigation needs to record the start of navigation which is why we
	// need to execute it before the click. See
	// https://github.com/puppeteer/puppeteer/issues/1412
	await Promise.all( [
		page.waitForNavigation(),
		page.click( 'button[type="submit"]' )
	] );
};

module.exports = loginReload;
