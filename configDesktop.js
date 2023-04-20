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
	//
	// Pages
	//
	{
		label: 'Main page (#vector-2022)',
		path: '/wiki/Main_Page'
	},
	{
		label: 'User page (#vector-2022)',
		path: '/wiki/User:Admin'
	},
	{
		label: 'User sub pages (#vector-2022)',
		path: '/wiki/User:Admin/common.js'
	},
	{
		label: 'Empty user page (#vector-2022)',
		path: '/wiki/User:Echo1'
	},
	{
		label: 'Special page (#vector-2022)',
		path: '/wiki/Special:BlankPage'
	},
	{
		label: 'Special page full width (#vector-2022, #limited-width-disabled)',
		path: '/wiki/Special:BlankPage',
		viewports: [
			VIEWPORT_DESKTOP_WIDEST
		]
	},
	{
		label: 'Full article page (#vector-2022)',
		path: '/wiki/Test'
	},
	{
		label: 'Article history page (#vector-2022)',
		path: '/w/index.php?title=Test&action=history'
	},
	{
		label: 'Article talk page (#vector-2022)',
		path: '/wiki/Talk:Test'
	},
	//
	// Layout
	//
	{
		label: '3 column (#vector-2022, #logged-in)',
		path: '/wiki/Test'
	},
	{
		label: '3 column full width (#vector-2022, #logged-in, #limited-width-disabled)',
		path: '/wiki/Test',
		viewports: [
			VIEWPORT_DESKTOP_WIDEST
		]
	},
	{
		label: '2 column (#vector-2022, #logged-in, #toc-unpinned, #main-menu-unpinned)',
		path: '/wiki/Test'
	},
	{
		label: '2 column full width (#vector-2022, #logged-in, #toc-unpinned, #main-menu-unpinned, #limited-width-disabled)',
		path: '/wiki/Test',
		viewports: [
			VIEWPORT_DESKTOP_WIDEST
		]
	},
	{
		label: '1 column (#vector-2022, #logged-in, #toc-unpinned, #main-menu-unpinned, #page-tools-unpinned)',
		path: '/wiki/Test'
	},
	{
		label: '1 column full width (#vector-2022, #logged-in, #toc-unpinned, #main-menu-unpinned, #page-tools-unpinned, #limited-width-disabled)',
		path: '/wiki/Test',
		viewports: [
			VIEWPORT_DESKTOP_WIDEST
		]
	},
	//
	// TOC
	//
	{
		label: 'TOC pinned with hidden subsections (#vector-2022, #toggle-toc-subsections)',
		path: '/wiki/Test',
		viewports: [
			VIEWPORT_DESKTOP,
			VIEWPORT_DESKTOP_WIDE,
			VIEWPORT_DESKTOP_WIDEST
		]
	},
	{
		label: 'TOC unpinned in page title (#vector-2022, #toc-unpinned, #toc-open)',
		path: '/wiki/Test'
	},
	{
		label: 'TOC unpinned below page title (#vector-2022, #scroll, #toc-unpinned, #toc-open)',
		path: '/wiki/Test'
	},
	{
		label: 'TOC pinned below page title (#vector-2022, #scroll)',
		path: '/wiki/Test',
		viewports: [
			VIEWPORT_DESKTOP,
			VIEWPORT_DESKTOP_WIDE,
			VIEWPORT_DESKTOP_WIDEST
		]
	},
	//
	// Sticky header
	//
	{
		label: 'Sticky header with pinned TOC (#vector-2022, #logged-in, #scroll)',
		path: '/wiki/Test',
		viewports: [
			VIEWPORT_DESKTOP,
			VIEWPORT_DESKTOP_WIDE,
			VIEWPORT_DESKTOP_WIDEST
		]
	},
	{
		label: 'Sticky header with unpinned TOC (#vector-2022, #logged-in, #scroll, #toc-unpinned, #toc-open)',
		path: '/wiki/Test',
		viewports: [
			VIEWPORT_DESKTOP,
			VIEWPORT_DESKTOP_WIDE,
			VIEWPORT_DESKTOP_WIDEST
		]
	},
	{
		label: 'Sticky header full width (#vector-2022, #logged-in, #scroll, #limited-width-disabled)',
		path: '/wiki/Test',
		viewports: [
			VIEWPORT_DESKTOP_WIDEST
		]
	},
	//
	// Search
	//
	{
		label: 'Search in header (#vector-2022, #search-focus)',
		path: '/wiki/Test'
	},
	{
		label: 'Search loading in header (#vector-2022, #search-focus, #search-offline)',
		path: '/wiki/Test'
	},
	{
		label: 'Search in sticky header (#logged-in, #vector-2022, #scroll, #search-sticky, #search-focus)',
		path: '/wiki/Test',
		viewports: [
			VIEWPORT_DESKTOP,
			VIEWPORT_DESKTOP_WIDE,
			VIEWPORT_DESKTOP_WIDEST
		]
	},
	//
	// Dropdowns
	//
	{
		label: 'Anon user links dropdown (#vector-2022, #user-links-open)',
		path: '/wiki/Test',
		viewports: [
			VIEWPORT_PHONE,
			VIEWPORT_DESKTOP_WIDEST
		]
	},
	{
		label: 'Logged in user links dropdown (#vector-2022, #logged-in, #user-links-open)',
		path: '/wiki/Test',
		viewports: [
			VIEWPORT_PHONE,
			VIEWPORT_DESKTOP_WIDEST
		]
	},
	{
		label: 'Main menu dropdown (#vector-2022, #logged-in, #main-menu-unpinned, #main-menu-open)',
		path: '/wiki/Test',
		viewports: [
			VIEWPORT_PHONE,
			VIEWPORT_DESKTOP_WIDEST
		]
	},
	{
		label: 'Page tools dropdown (#vector-2022, #logged-in, #page-tools-unpinned, #page-tools-open)',
		path: '/wiki/Test',
		viewports: [
			VIEWPORT_PHONE,
			VIEWPORT_DESKTOP_WIDEST
		]
	},
	//
	// Legacy Vector
	//
	{
		label: 'Legacy Vector article page (#vector)',
		path: '/wiki/Test?useskin=vector',
		delay: 1500
	},
	{
		label: 'Legacy Vector article history page (#vector)',
		path: '/w/index.php?title=Test&action=history&useskin=vector',
		delay: 1500
	},
	{
		label: 'Legacy Vector article talk page (#vector)',
		path: '/wiki/Talk:Test?useskin=vector',
		delay: 1500
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
		waitTimeout: 90000, // 90 second request timeout
		args: [
			'--no-sandbox'
		]
	},
	asyncCaptureLimit: 10,
	asyncCompareLimit: 50,
	debug: false,
	debugWindow: false
};
