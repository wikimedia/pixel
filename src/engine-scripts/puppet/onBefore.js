/**
 * Runs before each scenario -- use for setting cookies or other env state (.js suffix is optional)
 *
 * @param {import("puppeteer").Page} page
 * @param {import("backstopjs").Scenario} scenario
 */
module.exports = async ( page, scenario ) => {
	await require( './loadCookies' )( page, scenario );
	const hashtags = scenario.label.match( /(#[^ ,)]*)/g ) || [];
	const requireLogin = hashtags.includes( '#logged-in' );
	if ( requireLogin ) {
		console.log( 'Login' );
		await require( './loginReload' )( page, scenario );
		console.log( 'Login complete.' );
	}
};
