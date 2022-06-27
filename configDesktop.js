const BASE_URL = process.env.MW_SERVER;
const {
	VIEWPORT_PHONE,
	VIEWPORT_TABLET,
	VIEWPORT_DESKTOP,
	VIEWPORT_DESKTOP_WIDE
} = require( './viewports' );

const tests = [
	{
		label: 'Main_Page (#vector-2022)',
		path: '/wiki/Main_Page'
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
		label: 'Test (#logged-in, #vector-2022, #scroll, #search-sticky, #search-focus)',
		path: '/wiki/Test',
		selectors: [ 'viewport' ],
		// No search icon present if no sticky header present, so limit to this viewport
		viewports: [
			VIEWPORT_DESKTOP_WIDE
		]
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
		label: 'Special:BlankPage (#vector-2022, #userMenu-open)',
		path: '/wiki/Special:BlankPage'
	},
	{
		label: 'Special:RecentChanges (#vector-2022, no max width, #sidebar-closed)',
		path: '/wiki/Special:SpecialPages'
	},
	{
		label: 'Test sticky header (#vector-2022, #scroll)',
		path: '/wiki/Test',
		selectors: [ 'viewport' ]
	},
	{
		label: 'Test sticky header scroll with sidebar (#vector-2022, #sidebar-open, #scroll)',
		path: '/wiki/Test',
		selectors: [ 'viewport' ],
		// Smoke test sticky header scroll with the sidebar open. Limit to desktop
		// wide viewport to minimize duplication with other tests.  See T309807 for
		// an example bug.
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
		label: 'Edit (#vector-2022)',
		path: '/wiki/Test?action=edit',
		selectors: [ 'viewport' ]
	},
	{
		label: 'Visual edit (#vector-2022)',
		path: '/wiki/Test?veaction=edit',
		selectors: [ 'viewport' ]
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
	return Object.assign( {
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
		VIEWPORT_DESKTOP_WIDE
	],
	onBeforeScript: 'puppet/onBefore.js',
	onReadyScript: 'puppet/onReady.js',
	scenarios,
	paths: {
		// eslint-disable-next-line camelcase
		bitmaps_reference: 'report/reference-screenshots-desktop',
		// eslint-disable-next-line camelcase
		bitmaps_test: 'report/test-screenshots-desktop',
		// eslint-disable-next-line camelcase
		engine_scripts: 'src/engine-scripts',
		// eslint-disable-next-line camelcase
		html_report: 'report/desktop',
		// eslint-disable-next-line camelcase
		ci_report: 'report/ci-report',
		// eslint-disable-next-line camelcase
		json_report: 'report/json-report'
	},
	report: [],
	engine: 'puppeteer',
	engineOptions: {
		args: [
			'--no-sandbox'
		]
	},
	asyncCaptureLimit: 5,
	asyncCompareLimit: 50,
	debug: false,
	debugWindow: false
};
