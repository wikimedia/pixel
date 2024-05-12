/**
 * @param {Array} hashtags
 * @return {string} of a username active in the wiki,
 *   all usernames share the same password as the Admin user.
 */
const getUsernameFromHashtags = ( hashtags ) => {
	if ( hashtags.includes( '#amc' ) ) {
		return 'AMCUser';
	} else if ( hashtags.includes( '#echo-100' ) ) {
		return 'Echo100';
	} else if ( hashtags.includes( '#echo-1' ) ) {
		return 'Echo1';
	} else if ( hashtags.includes( '#echo-1-seen' ) ) {
		return 'Echo1Seen';
	} else {
		return 'Admin';
	}
};

const applyFilterToConsoleLog = () => {
	const origConsoleLog = console.log;
	console.log = ( ...args ) => {
		if ( ![
		// Lines matching these regexes will not be console logged
			/BackstopTools have been installed/i
		].some( ( regex ) => regex.test( args.join( ' ' ) ) ) ) {
			origConsoleLog( ...args );
		}
	};
};

/**
 * Runs before each scenario -- use for setting cookies or other env state (.js suffix is optional)
 *
 * @param {import("puppeteer").Page} page
 * @param {import("backstopjs").Scenario} scenario
 */
module.exports = async ( page, scenario ) => {
	applyFilterToConsoleLog();
	const hashtags = scenario.label.match( /(#[^ ,)]*)/g ) || [];
	const requireLogin = hashtags.includes( '#logged-in' );
	if ( requireLogin ) {
		await require( './loadCookies' )( page, getUsernameFromHashtags( hashtags ) );
	}
};
