/**
 * Runs before each scenario -- use for setting cookies or other env state (.js suffix is optional)
 *
 * @param {import("puppeteer").Page} page
 * @param {import("backstopjs").Scenario} scenario
 */
module.exports = async ( page, scenario ) => {
	await require( './loadCookies' )( page, scenario );
};
