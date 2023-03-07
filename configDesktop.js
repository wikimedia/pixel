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
		label: 'Test (#vector-2022, #main-menu-open)',
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
		label: 'Test (#vector-2022)',
		path: '/wiki/Test',
		selectors: [ 'html' ]
	},
	{
		label: 'Test expanded TOC (#vector-2022, #toggle-toc-subsections)',
		path: '/wiki/Test',
		viewports: [
			VIEWPORT_DESKTOP,
			VIEWPORT_DESKTOP_WIDE
		]
	},
	{
		label: 'Special:BlankPage (#vector-2022, #main-menu-open)',
		path: '/wiki/Special:BlankPage'
	},
	{
		label: 'Special:BlankPage (#vector-2022, #limited-width-disabled)',
		path: '/wiki/Test',
		viewports: [
			VIEWPORT_DESKTOP_WIDEST
		]
	},
	{
		label: 'Test (#vector-2022, #toc-unpinned)',
		path: '/wiki/Test',
		// Limit to large viewports to minimize duplication
		viewports: [
			VIEWPORT_DESKTOP, VIEWPORT_DESKTOP_WIDE
		]
	},
	{
		label: 'Test (#vector-2022, #toc-unpinned, #toc-open)',
		path: '/wiki/Test'
	},
	{
		label: 'Test (#vector-2022, #toc-unpinned, #toc-open)',
		path: '/wiki/Test'
	},
	{
		label: 'Special:BlankPage (#vector-2022, #user-links-open)',
		path: '/wiki/Special:BlankPage'
	},
	{
		label: 'Special:RecentChanges (#vector-2022, no max width)',
		path: '/wiki/Special:SpecialPages'
	},
	{
		label: 'Test anon floating TOC (#vector-2022, #scroll, #toc-unpinned, #toc-open)',
		path: '/wiki/Test',
		viewports: [
			VIEWPORT_TABLET,
			VIEWPORT_PHONE
		]
	},
	{
		label: 'Test anon scroll (#vector-2022, #scroll)',
		path: '/wiki/Test',
		viewports: [
			VIEWPORT_DESKTOP,
			VIEWPORT_DESKTOP_WIDE,
			VIEWPORT_DESKTOP_WIDEST
		]
	},
	{
		label: 'Test anon scroll with sidebar (#vector-2022, #main-menu-open, #scroll)',
		path: '/wiki/Test',
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
		label: 'Test (#vector-2022, #logged-in, #limited-width-disabled)',
		path: '/wiki/Test',
		viewports: [
			VIEWPORT_DESKTOP_WIDEST
		]
	},
	{
		label: 'Test (#vector-2022, #logged-in, #toc-unpinned, #main-menu-unpinned, #limited-width-disabled)',
		path: '/wiki/Test',
		viewports: [
			VIEWPORT_DESKTOP_WIDEST
		]
	},
	{
		label: 'Test (#vector-2022, #logged-in, #toc-unpinned, #main-menu-unpinned, #page-tools-unpinned, #limited-width-disabled)',
		path: '/wiki/Test',
		viewports: [
			VIEWPORT_DESKTOP_WIDEST
		]
	},
	{
		label: 'Test (#logged-in, #vector-2022, #scroll, #search-sticky, #search-focus)',
		path: '/wiki/Test',
		// No search icon present if no sticky header present, so limit to this viewport
		viewports: [
			VIEWPORT_DESKTOP_WIDE
		]
	},
	{
		label: 'Special:BlankPage with user menu open (#vector-2022, #logged-in, #user-links-open)',
		path: '/wiki/Special:BlankPage'
	},
	{
		label: 'Test sticky header (#vector-2022, #logged-in, #scroll)',
		path: '/wiki/Test',
		viewports: [
			VIEWPORT_DESKTOP
		]
	},
	{
		label: 'Test sticky header (#vector-2022, #limited-width-disabled, #logged-in, #scroll)',
		path: '/wiki/Test',
		viewports: [
			VIEWPORT_DESKTOP_WIDEST
		]
	},
	{
		label: 'Test sticky header (#vector-2022, #logged-in, #scroll, #toc-unpinned)',
		path: '/wiki/Test',
		// Limit to viewports where the sticky header is visible
		viewports: [
			VIEWPORT_DESKTOP, VIEWPORT_DESKTOP_WIDE
		]
	},
	{
		label: 'Test sticky header (#vector-2022, #logged-in, #scroll, #toc-unpinned, #toc-open)',
		path: '/wiki/Test',
		// Limit to viewports where the sticky header is visible
		viewports: [
			VIEWPORT_DESKTOP, VIEWPORT_DESKTOP_WIDE
		]
	},
	{
		label: 'Special:Homepage (#vector-2022, #logged-in)',
		path: '/wiki/Special:Homepage'
	},
	{
		label: 'Main_Page (#vector)',
		path: '/wiki/Main_Page?useskin=vector',
		// FIXME: Delay is needed to wait for legacy Vector's dancing tabs to stop
		// dancing.
		delay: 1500
	},
	{
		label: 'Test (#vector)',
		path: '/wiki/Test?useskin=vector',
		selectors: [ 'html' ],
		delay: 1500
	},
	{
		label: 'Test?action=History (#vector)',
		path: '/w/index.php?title=Test&action=history&useskin=vector',
		delay: 1500
	},
	{
		label: 'Talk:Test (#vector)',
		path: '/wiki/Talk:Test?useskin=vector',
		delay: 1500
	},
	{
		label: 'Tree (#vector)',
		path: '/wiki/Tree?useskin=vector',
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
		args: [
			'--no-sandbox'
		]
	},
	asyncCaptureLimit: 10,
	asyncCompareLimit: 50,
	debug: false,
	debugWindow: false
};
