const strippedCookies = require( '../cookies.json' );

/**
 * @param {import('puppeteer').Page} page
 */
module.exports = async ( page ) => {
	const cookies = strippedCookies.map( ( cookie ) => {
		return {
			domain: 'localhost',
			...cookie
		};
	} );

	await page.setCookie( ...cookies );

	console.log( 'Cookie state restored' );
};
