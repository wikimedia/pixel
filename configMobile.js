const configFactory = require( './configFactory.js' );
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
	}
];

const scenarios = tests.map( ( test ) => {
	return Object.assign( {
		selectors: [ 'viewport' ]
	}, test, {
		url: `${BASE_URL}${test.path}`
	} );
} );

module.exports = configFactory( 'mobile', scenarios );
