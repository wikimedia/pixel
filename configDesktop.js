const BASE_URL = process.env.MW_SERVER;
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
		// account for mismatch due to border color change animation
		misMatchThreshold: 0.5,
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
		label: 'Special:BlankPage with user menu open (#vector-2022, #logged-in, #userMenu-open)',
		path: '/wiki/Special:BlankPage'
	},
	{
		label: 'Test sticky header (#vector-2022, #logged-in, #scroll)',
		path: '/wiki/Test',
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
	return Object.assign( {}, test, {
		url: `${BASE_URL}${test.path}`,
		misMatchThreshold: 0.04
	} );
} );

module.exports = {
	id: 'MediaWiki',
	viewports: [
		{
			label: 'phone',
			width: 320,
			height: 480
		},
		{
			label: 'tablet',
			width: 720,
			height: 768
		},
		{
			label: 'desktop',
			width: 1000,
			height: 900
		},
		{
			label: 'desktop-wide',
			width: 1792,
			height: 900
		}
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
