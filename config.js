const BASE_URL = process.env.MW_SERVER;
const tests = [
	{
		label: 'Main_Page (#vector-2022)',
		path: '/wiki/Main_Page'
	},
	{
		label: 'Test (#vector-2022, #sidebar-closed, #userMenu-closed)',
		path: '/wiki/Test'
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
		path: '/wiki/Main_Page?useskin=vector'
	},
	{
		label: 'Test (#vector)',
		path: '/wiki/Test?useskin=vector'
	},
	{
		label: 'Test?action=History (#vector)',
		path: '/w/index.php?title=Test&action=history&useskin=vector'
	},
	{
		label: 'Talk:Test (#vector)',
		path: '/wiki/Talk:Test'
	},
	{
		label: 'Tree (#vector)',
		path: '/wiki/Tree?useskin=vector'
	}
];

const scenarios = tests.map( ( test ) => {
	return Object.assign( {}, test, {
		url: `${BASE_URL}${test.path}`,
		delay: 1500,
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
		bitmaps_reference: 'report/reference-screenshots',
		// eslint-disable-next-line camelcase
		bitmaps_test: 'report/test-screenshots',
		// eslint-disable-next-line camelcase
		engine_scripts: 'src/engine-scripts',
		// eslint-disable-next-line camelcase
		html_report: 'report',
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
