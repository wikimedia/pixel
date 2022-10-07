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
		label: 'Main_Page (#vector-2022)',
		path: '/wiki/Main_Page'
	},
	{
		label: 'Testing user page (#vector-2022)',
		path: '/wiki/User:Admin'
	},
	{
		label: 'Testing empty user page (#vector-2022)',
		path: '/wiki/User:Echo1'
	},
	{
		label: 'Testing user sub pages (#vector-2022)',
		path: '/wiki/User:Admin/common.js'
	},
	{
		label: 'Test (#vector-2022, #sidebar-open)',
		path: '/wiki/Test',
		selectors: [ 'html' ]
	},
	{
		label: 'Test (#vector-2022, #search-focus)',
		path: '/wiki/Test',
		selectors: [ 'html' ]
	},
	{
		label: 'Test (#vector-2022, #search-focus, #search-offline)',
		path: '/wiki/Test',
		selectors: [ 'html' ]
	},
	{
		label: 'Test (#vector-2022, #sidebar-closed)',
		path: '/wiki/Test',
		selectors: [ 'html' ]
	},
	{
		label: 'Special:BlankPage (#vector-2022, #sidebar-open)',
		path: '/wiki/Special:BlankPage'
	},
	{
		label: 'Test (#vector-2022, #sidebar-closed, #collapsed-toc-closed)',
		path: '/wiki/Test',
		selectors: [ 'viewport' ],
		// Limit to large viewports to minimize duplication
		viewports: [
			VIEWPORT_DESKTOP, VIEWPORT_DESKTOP_WIDE
		]
	},
	{
		label: 'Test (#vector-2022, #sidebar-closed, #collapsed-toc-open)',
		path: '/wiki/Test',
		selectors: [ 'viewport' ]
	},
	{
		label: 'Test (#vector-2022, #sidebar-open, #collapsed-toc-open)',
		path: '/wiki/Test',
		selectors: [ 'viewport' ]
	},
	{
		label: 'Special:BlankPage (#vector-2022, #userMenu-open)',
		path: '/wiki/Special:BlankPage'
	},
	{
		label: 'Special:RecentChanges (#vector-2022, no max width, #sidebar-closed)',
		path: '/wiki/Special:SpecialPages'
	},
	{
		label: 'Test anon scroll (#vector-2022, #scroll)',
		path: '/wiki/Test',
		selectors: [ 'viewport' ]
	},
	{
		label: 'Test anon scroll with sidebar (#vector-2022, #sidebar-open, #scroll)',
		path: '/wiki/Test',
		selectors: [ 'viewport' ],
		// Smoke test anon scroll with the sidebar open. Limit to desktop
		// wide viewport to minimize duplication with other tests.  See T309807 for
		// an example bug.
		viewports: [
			VIEWPORT_DESKTOP_WIDE
		]
	},
	{
		label: 'Test?action=History (#vector-2022)',
		path: '/w/index.php?title=Test&action=history'
	},
	{
		label: 'Talk:Test (#vector-2022)',
		path: '/wiki/Talk:Test'
	},
	{
		label: 'Tree (#vector-2022)',
		path: '/wiki/Tree'
	},
	{
		label: 'Test (#vector-2022, #logged-in)',
		path: '/wiki/Test',
		selectors: [ 'html' ]
	},
	{
		label: 'Test (#logged-in, #vector-2022, #scroll, #search-sticky, #search-focus)',
		path: '/wiki/Test',
		selectors: [ 'viewport' ],
		// No search icon present if no sticky header present, so limit to this viewport
		viewports: [
			VIEWPORT_DESKTOP_WIDE
		]
	},
	{
		label: 'Special:BlankPage with user menu open (#vector-2022, #logged-in, #userMenu-open)',
		path: '/wiki/Special:BlankPage'
	},
	{
		label: 'Test sticky header (#vector-2022, #logged-in, #scroll)',
		path: '/wiki/Test',
		selectors: [ 'viewport' ]
	},
	{
		label: 'Test sticky header (#vector-2022, #logged-in, #scroll, #collapsed-toc-closed)',
		path: '/wiki/Test',
		selectors: [ 'viewport' ],
		// Limit to viewports where the sticky header is visible
		viewports: [
			VIEWPORT_DESKTOP, VIEWPORT_DESKTOP_WIDE
		]
	},
	{
		label: 'Test sticky header (#vector-2022, #logged-in, #scroll, #collapsed-toc-open)',
		path: '/wiki/Test',
		selectors: [ 'viewport' ],
		// Limit to viewports where the sticky header is visible
		viewports: [
			VIEWPORT_DESKTOP, VIEWPORT_DESKTOP_WIDE
		]
	},
	{
		label: 'Special:Homepage (#vector-2022, #logged-in)',
		path: '/wiki/Special:Homepage',
		selectors: [ 'viewport' ]
	},
	{
		label: 'Main_Page (#vector)',
		delay: 1500,
		path: '/wiki/Main_Page?useskin=vector'
	},
	{
		label: 'Test (#vector)',
		delay: 1500,
		path: '/wiki/Test?useskin=vector',
		selectors: [ 'html' ]
	},
	{
		label: 'Test?action=History (#vector)',
		delay: 1500,
		path: '/w/index.php?title=Test&action=history&useskin=vector'
	},
	{
		label: 'Talk:Test (#vector)',
		delay: 1500,
		path: '/wiki/Talk:Test?useskin=vector'
	},
	{
		label: 'Tree (#vector)',
		delay: 1500,
		path: '/wiki/Tree?useskin=vector'
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
	paths: utils.makePaths( 'desktop' ),
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
