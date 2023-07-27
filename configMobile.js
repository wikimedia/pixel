const configDesktop = require( './configDesktop.js' );
const utils = require( './utils' );

const BASE_URL = process.env.PIXEL_MW_SERVER;
const tests = [
	{
		label: 'Tree (#minerva #mobile)',
		path: '/wiki/Tree'
	},
	{
		label: 'Test (#minerva #mobile)',
		path: '/wiki/Test'
	},
	{
		label: 'Test (#minerva #mobile #logged-in)',
		path: '/wiki/Test'
	},
	{
		label: 'Test (#minerva #mobile #mainmenu-open)',
		path: '/wiki/Test'
	},
	{
		label: 'Test (#minerva #mobile #logged-in #mainmenu-open)',
		path: '/wiki/Test'
	},
	{
		label: 'Filled in user page (#minerva #mobile)',
		path: '/wiki/User:Admin'
	},
	{
		label: 'User subpage (#minerva #mobile)',
		path: '/wiki/User:Admin/common.js'
	},
	{
		label: 'Non-existent user page (#minerva #mobile)',
		path: '/wiki/User:Echo1'
	},
	{
		label: 'Test language overlay (#minerva #mobile #click-language)',
		path: '/wiki/Test'
	},
	{
		label: 'Test CTADrawer (#minerva #mobile #click-watch)',
		path: '/wiki/Test'
	},
	{
		label: 'Test red link drawer (#minerva #mobile #click-redlink)',
		path: '/wiki/Test'
	},
	{
		label: 'Test (#minerva #mobile #logged-in #click-edit)',
		path: '/wiki/Test'
	},
	{
		label: 'Diff page logged in (#minerva #mobile #logged-in)',
		path: '/wiki/Special:MobileDiff/358'
	},
	{
		label: 'Page issues (#minerva #mobile)',
		path: '/wiki/Page_issue'
	}
];

const scenarios = tests.map( ( test ) => {
	const isMinerva = test.label.indexOf( '#minerva' );
	const isMobile = test.label.indexOf( '#mobile' );
	const flags = {};
	if ( isMobile ) {
		flags.useformat = 'mobile';
	}
	if ( isMinerva ) {
		flags.useskin = 'minerva';
	}

	return utils.addFeatureFlagQueryStringsToScenario(
		Object.assign( {
			url: `${BASE_URL}${test.path}`,
			// Using 'html' instead of 'viewport' due to flakiness of toolbar's text
			// color. This is likely caused by a bug in either backstopjs or
			// puppeteer.
			selectors: [ 'html' ]
		}, test ),
		flags
	);
} );

module.exports = Object.assign( {}, configDesktop, {
	scenarios,
	paths: utils.makePaths( 'mobile' )
} );
