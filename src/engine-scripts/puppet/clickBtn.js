/**
 * Open or close Vector-2022's sidebar.
 *
 * @param {import('puppeteer').Page} page
 * @param {string} selector
 * @param {string} waitForSelector
 */
module.exports = async ( page, selector, waitForSelector = '.drawer,.overlay' ) => {
	await page.evaluate( async ( s ) => {
		const btn = document.querySelector( s );
		btn.click();
	}, selector );
	await page.waitForSelector( waitForSelector );
};
