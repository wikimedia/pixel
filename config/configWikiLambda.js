const BASE_URL = process.env.PIXEL_MW_SERVER;
const configCommon = require( './configCommon' );
const utils = require( '../utils' );
const {
	VIEWPORT_PHONE,
	VIEWPORT_TABLET,
	VIEWPORT_DESKTOP,
	VIEWPORT_DESKTOP_WIDE,
	VIEWPORT_DESKTOP_WIDEST
} = require( '../viewports' );

const tests = [
	//
	// Pages
	//
	{
		label: 'Special:CreateZObject (#vector-2022)',
		path: '/wiki/Special:CreateZObject'
	},
	{
		label: 'Special:EvaluateFunctionCall (#vector-2022)',
		path: '/wiki/Special:EvaluateFunctionCall'
	},
	{
		label: 'Z1 (#vector-2022)',
		path: '/wiki/Z1'
	},
	{
		label: 'Z104 (#vector-2022)',
		path: '/wiki/Z104'
	},
	{
		label: 'Z204 (#vector-2022)',
		path: '/wiki/Z204'
	},
	{
		label: 'Z500 (#vector-2022)',
		path: '/wiki/Z500'
	},
	{
		label: 'Z600 (#vector-2022)',
		path: '/wiki/Z600'
	},
	{
		label: 'Z801 (#vector-2022)',
		path: '/wiki/Z801'
	},
	{
		label: 'Z901 (#vector-2022)',
		path: '/wiki/Z901'
	},
	{
		label: 'Z1001 (#vector-2022)',
		path: '/wiki/Z1001'
	},
	{
		label: 'Z8010 (#vector-2022)',
		path: '/wiki/Z8010'
	}
];

const scenarios = tests.map( ( test ) => {
	return {
		selectors: [ 'viewport' ],
		url: `${BASE_URL}${test.path}`,
		misMatchThreshold: 0.04,
		...test
	};
} );

module.exports = {
	...configCommon,
	id: 'wikilambda',
	onBeforeScript: 'puppet/onBefore.js',
	onReadyScript: 'puppet/onReady.js',
	viewports: [
		VIEWPORT_PHONE,
		VIEWPORT_TABLET,
		VIEWPORT_DESKTOP,
		VIEWPORT_DESKTOP_WIDE,
		VIEWPORT_DESKTOP_WIDEST
	],
	scenarios,
	paths: utils.makePaths( 'wikilambda' )
};
