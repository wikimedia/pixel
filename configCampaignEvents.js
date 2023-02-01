const BASE_URL = process.env.PIXEL_MW_SERVER;
const utils = require( './utils' );
const {
	VIEWPORT_PHONE,
	VIEWPORT_TABLET,
	VIEWPORT_DESKTOP,
	VIEWPORT_DESKTOP_WIDE,
	VIEWPORT_DESKTOP_WIDEST
} = require( './viewports' );

const tests = [
	{
		label: 'Enable Event Registration (#logged-in)',
		path: '/wiki/Special:EnableEventRegistration',
		hashtags: [ '#logged-in' ]
	}
];

const scenarios = tests.map( ( test ) => {
	return {
		url: `${BASE_URL}${test.path}`,
		misMatchThreshold: 0.04,
		selectors: [ 'main' ],
		removeSelectors: [ '.vector-column-end' ],
		...test
	};
} );

module.exports = {
	id: 'MediaWiki',
	viewports: [
		VIEWPORT_PHONE,
		VIEWPORT_TABLET,
		VIEWPORT_DESKTOP,
		VIEWPORT_DESKTOP_WIDE,
		VIEWPORT_DESKTOP_WIDEST
	],
	onBeforeScript: 'puppet/onBefore.js',
	onReadyScript: 'puppet/onReady.js',
	scenarios,
	paths: utils.makePaths( 'campaign-events' ),
	report: [],
	engine: 'puppeteer',
	engineOptions: {
		args: [
			'--no-sandbox'
		]
	},
	asyncCaptureLimit: 10,
	asyncCompareLimit: 50,
	debug: false,
	debugWindow: false
};
