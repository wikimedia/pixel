const configDesktop = require( './configDesktop.js' );
const utils = require( './utils' );

const BASE_URL = process.env.PIXEL_MW_SERVER;

/**
 * @typedef {Object} BaseScenario
 * @property {string} label
 * @property {string} path
 * @property {string[]} hashtags
 */

/**
 * @callback BaseScenarioCallback
 * @param {BaseScenario} baseScenario
 */

/**
 * Be careful when expanding the list of tests here.
 * Each scenario represents 8 scenarios:
 * - Vector skin (mobile + tablet + desktop + desktop wide)
 * - Vector 2022 skin (mobile + tablet + desktop + desktop wide)
 * - Minerva skin (mobile + tablet + desktop + desktop wide)
 */
const baseScenarios = /** @type {BaseScenario[]} */ ( [
	{
		label: 'Echo smoke test with 0 notifications',
		path: '/wiki/Test',
		hashtags: []
	},
	{
		label: 'Echo smoke test with 1 notifications',
		path: '/wiki/Test',
		hashtags: [ '#echo-1' ]
	},

	{
		label: 'Echo smoke test with 1 seen notifications',
		path: '/wiki/Test',
		hashtags: [ '#echo-1-seen' ]
	},
	{
		label: 'Echo smoke test with 99+ notifications',
		path: '/wiki/Test',
		hashtags: [ '#echo-100' ]
	},
	// Important: Don't use the #echo-drawer tag on echo-100 or echo-1,
	// doing so will trigger "seen" status and change the color of the notification
	// icon from red to gray.
	{
		label: 'Echo smoke test with 0 notifications',
		path: '/wiki/Test',
		hashtags: [ '#echo-drawer' ]
	}
] );

/**
 * Creates a list of tests with the given query string and hashtags.
 *
 * @param {string[]} hashtags additional hashtags
 * @param {string} queryString to add to URL.
 * @param {Object} additionalConfig
 * @return {BaseScenarioCallback} of scenarios.
 */
const makeScenarios = ( hashtags, queryString, additionalConfig = {} ) => {
	return ( test ) => {
		const hashtagString = hashtags.concat( [ '#logged-in', '#echo' ] ).concat(
			test.hashtags
		).join( ' ' );
		return Object.assign( {
			removeSelectors: [
				'.skin-vector-2022 .mw-workspace-container',
				'.skin-vector #content',
				'.skin-vector #mw-panel',
				'.mw-table-of-contents-container',
				'.skin-vector #footer',
				'.skin-vector #left-navigation',
				'.skin-vector #right-navigation',
				'.skin-minerva #content',
				'.skin-minerva footer'
			],
			selectors: [ 'html' ]
		}, test, {
			label: `${test.label} (${hashtagString})`,
			url: `${BASE_URL}${test.path}?${queryString}`
		}, additionalConfig );
	};
};

/**
 * Expands the list of tests so there is one for mobile and one for desktop.
 *
 * @param {BaseScenario[]} tests
 * @return {import("backstopjs").Scenario[]}
 */
const makeMobileAndDesktopScenarios = ( tests ) => {
	return tests.map(
		makeScenarios(
			// mobile
			[ '#minerva', '#mobile' ],
			'useskin=minerva&useformat=mobile'
		)
	).concat(
		// desktop
		tests.map(
			makeScenarios(
				[ '#vector' ],
				'useskin=vector&useformat=desktop',
				{
					// In legacy Vector dancing tabs are common so we permit more mismatch.
					misMatchThreshold: 2
				}
			)
		)
	).concat(
		// desktop
		tests.map(
			makeScenarios(
				[ '#vector-2022' ],
				'useskin=vector-2022&useformat=desktop'
			)
		)
	);
};

const scenarios = makeMobileAndDesktopScenarios( baseScenarios );

module.exports = Object.assign( {}, configDesktop, {
	scenarios,
	paths: utils.makePaths( 'echo' )
} );
