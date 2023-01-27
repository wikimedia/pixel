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
	// On mobile, short pages will cause false positives on some patchsets e.g.
	// the switchover to grid CSS.  To avoid this use the viewport selector when
	// not defined.
	const urlParts = test.path.split( '?' );
	const urlPath = urlParts[ 0 ];
	const urlQueryString = urlParts[ 1 ] || '';
	const useViewportSelector = [
		'/wiki/Main_Page',
		'/wiki/Talk:Test',
		'/wiki/Tree',
		'/wiki/Special:SpecialPages',
		'/wiki/Special:BlankPage'
	].includes( urlPath ) || (
		[
			'action=history'
		].filter( ( t ) => urlQueryString.includes( t ) )
	).length > 0;

	return Object.assign( {
		selectors: useViewportSelector ? [ 'viewport' ] : undefined
	}, test, {
		url: `${BASE_URL}${test.path}`,
		misMatchThreshold: 0.04
	}, test );
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
