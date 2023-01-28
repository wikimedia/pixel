/**
 * @param {Array} hashtags
 * @return {string} of a username active in the wiki,
 *   all usernames share the same password as the Admin user.
 */
const getUsernameFromHashtags = ( hashtags ) => {
	if ( hashtags.includes( '#echo-100' ) ) {
		return 'Echo100';
	} else if ( hashtags.includes( '#echo-1' ) ) {
		return 'Echo1';
	} else if ( hashtags.includes( '#echo-1-seen' ) ) {
		return 'Echo1Seen';
	} else {
		return 'Admin';
	}
};

/**
 * Runs before each scenario -- use for setting cookies or other env state (.js suffix is optional)
 *
 * @param {import("playwright").Page} _page
 * @param {import("backstopjs").Scenario} scenario
 * @param {import("backstopjs").Viewport} _viewport
 * @param {boolean} _isReference
 * @param {import("playwright").BrowserContext} browserContext
 */
module.exports = async ( _page, scenario, _viewport, _isReference, browserContext ) => {
	const hashtags = scenario.label.match( /(#[^ ,)]*)/g ) || [];
	const requireLogin = hashtags.includes( '#logged-in' );
	if ( requireLogin ) {
		await require( './loadCookies' )( browserContext, scenario, getUsernameFromHashtags( hashtags ) );
	}
};
