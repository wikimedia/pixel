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
		path: '/wiki/Test',
		selectors: []
	},
	{
		label: 'Article history page (#vector-2022)',
		path: '/w/index.php?title=Test&action=history'
	},
	{
		label: 'Article talk page (#vector-2022)',
		path: '/wiki/Talk:Test'
	},
	{
		label: 'Article talk page DT Disabled (#vector-2022)',
		path: '/wiki/Talk:Test?dtenable=0'
	},
	{
		label: 'Talk page discussions Parsoid (#vector-2022)',
		path: '/wiki/Talk:Test?useparsoid=1'
	},
	//
	// Layout
	//
	{
		label: '3 column (#vector-2022, #logged-in)',
		path: '/wiki/Test',
		selectors: []
	},
	{
		label: '3 column full width (#vector-2022, #logged-in, #limited-width-disabled)',
		path: '/wiki/Test',
		viewports: [
			VIEWPORT_DESKTOP_WIDEST
		],
		selectors: []
	},
	{
		label: '2 column (#vector-2022, #logged-in, #toc-unpinned, #main-menu-unpinned)',
		path: '/wiki/Test',
		selectors: []
	},
	{
		label: '2 column full width (#vector-2022, #logged-in, #toc-unpinned, #main-menu-unpinned, #limited-width-disabled)',
		path: '/wiki/Test',
		viewports: [
			VIEWPORT_DESKTOP_WIDEST
		],
		selectors: []
	},
	{
		label: '1 column (#vector-2022, #logged-in, #toc-unpinned, #main-menu-unpinned, #page-tools-unpinned)',
		path: '/wiki/Test',
		selectors: []
	},
	{
		label: '1 column full width (#vector-2022, #logged-in, #toc-unpinned, #main-menu-unpinned, #page-tools-unpinned, #limited-width-disabled)',
		path: '/wiki/Test',
		viewports: [
			VIEWPORT_DESKTOP_WIDEST
		],
		selectors: []
	},
	//
	// NIGHT THEME
	//
	{
		label: 'Night mode (#vector-2022, #logged-in, #toc-unpinned, #main-menu-unpinned, #page-tools-unpinned)',
		path: '/wiki/Test?vectornightmode=1',
		selectors: []
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
		],
		selectors: []
	},
	{
		label: 'TOC unpinned in page title (#vector-2022, #toc-unpinned, #toc-open)',
		path: '/wiki/Test',
		selectors: []
	},
	{
		label: 'TOC unpinned below page title (#vector-2022, #scroll, #toc-unpinned, #toc-open)',
		path: '/wiki/Test',
		selectors: []
	},
	{
		label: 'TOC pinned below page title (#vector-2022, #scroll)',
		path: '/wiki/Test',
		viewports: [
			VIEWPORT_DESKTOP,
			VIEWPORT_DESKTOP_WIDE,
			VIEWPORT_DESKTOP_WIDEST
		],
		selectors: []
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
	},
	{
		label: 'Talk page discussions (#vector)',
		path: '/wiki/Talk:Test?useskin=vector',
		delay: 1500
	},
	{
		label: 'Talk page discussions Parsoid (#vector)',
		path: '/wiki/Talk:Test?useskin=vector&useparsoid=1',
		delay: 1500
	},
	{
		label: 'Article talk page DT Disabled (#vector-2022)',
		path: '/wiki/Talk:Test?dtenable=0'
	},
	{
		label: 'MathML (#vector-2022)',
		path: '/wiki/MathTestNative'
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
	paths: utils.makePaths( 'desktop' )
};
