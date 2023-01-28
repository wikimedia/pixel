const allCookies = require( '../cookies.json' );

/**
 * @param {import('playwright').BrowserContext} browserContext
 * @param {import('backstopjs').Scenario} scenario
 * @param {string} username
 */
module.exports = async ( browserContext, scenario, username ) => {
	const strippedCookies = allCookies[ username ];
	const cookies = strippedCookies.map( ( cookie ) => {
		return {
			url: scenario.url,
			...cookie
		};
	} );

	await browserContext.addCookies( cookies );

	console.log( 'Cookie state restored' );
};
