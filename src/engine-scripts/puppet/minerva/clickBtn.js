/**
 * Open or close Vector-2022's sidebar.
 *
 * @param {import('puppeteer').Page} page
 * @param {string} selector
 */
module.exports = async ( page, selector ) => {
	await page.evaluate( async ( s ) => {
		const btn = document.querySelector( s );
		await btn.click();
	}, selector );
	await page.waitForSelector( '.drawer,.overlay' );
};
