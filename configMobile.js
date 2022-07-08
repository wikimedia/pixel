const configDesktop = require( './configDesktop.js' );
const utils = require( './utils' );

const BASE_URL = process.env.MW_SERVER;
const tests = [
	{
		label: 'Tree (#minerva #mobile)',
		path: '/wiki/Tree?useskin=minerva&useformat=mobile'
	},
	{
		label: 'Test (#minerva #mobile)',
		path: '/wiki/Test?useskin=minerva&useformat=mobile'
	},
	{
		label: 'Test (#minerva #mobile #logged-in)',
		path: '/wiki/Test?useskin=minerva&useformat=mobile'
	},
	{
		label: 'Test (#minerva #mobile #mainmenu-open)',
		path: '/wiki/Test?useskin=minerva&useformat=mobile'
	},
	{
		label: 'Test (#minerva #mobile #logged-in #mainmenu-open)',
		path: '/wiki/Test?useskin=minerva&useformat=mobile'
	},
	{
		label: 'Filled in user page (#minerva #mobile #logged-in)',
		path: '/wiki/User:Admin'
	},
	{
		label: 'User subpage (#minerva #mobile #logged-in)',
		path: '/wiki/User:Admin/common.js'
	},
	{
		label: 'Non-existent user page (#minerva #mobile #logged-in)',
		path: '/wiki/User:Echo1'
	}
];

const scenarios = tests.map( ( test ) => {
	return Object.assign( {
		selectors: [ 'viewport' ]
	}, test, {
		url: `${BASE_URL}${test.path}`
	} );
} );

module.exports = Object.assign( {}, configDesktop, {
	scenarios,
	paths: utils.makePaths( 'mobile' )
} );
