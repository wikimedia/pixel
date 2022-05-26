const config = require( './config.js' );

const BASE_URL = process.env.MW_SERVER;

/**
 * Be careful when expanding the list of tests here.
 * Each scenario represents 8 scenarios:
 * - Vector skin (mobile + tablet + desktop + desktop wide)
 * - Vector 2022 skin (mobile + tablet + desktop + desktop wide)
 * - Minerva skin (mobile + tablet + desktop + desktop wide)
 */
const baseScenarios = [
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
];

/**
 * Creates a list of tests with the given query string and hashtags.
 *
 * @param {Array} hashtags additional hashtags
 * @param {string} queryString to add to URL.
 * @param {Object} additionalConfig
 * @return {Array} of scenarios.
 */
const makeScenarios = ( hashtags, queryString, additionalConfig = {} ) => {
	return ( test ) => {
		const hashtagString = hashtags.concat( [ '#logged-in', '#echo' ] ).concat(
			test.hashtags
		).join( ' ' );
		return Object.assign( {
			selectors: [ 'viewport' ]
		}, test, {
			label: `${test.label} (${hashtagString})`,
			url: `${BASE_URL}${test.path}?${queryString}`
		}, additionalConfig );
	};
};

/**
 * Expands the list of tests so there is one for mobile and one for desktop.
 *
 * @param {Array} tests
 * @return {Array}
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

module.exports = Object.assign( {}, config, {
	scenarios,
	paths: Object.assign( {}, config.paths, {
		// eslint-disable-next-line camelcase
		bitmaps_reference: 'report/reference-screenshots-echo',
		// eslint-disable-next-line camelcase
		bitmaps_test: 'report/test-screenshots-echo',
		// eslint-disable-next-line camelcase
		html_report: 'report/echo'
	} )
} );
