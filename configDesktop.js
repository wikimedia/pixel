const configFactory = require( './configFactory' );
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
		delay: 1500,
		path: '/wiki/Main_Page?useskin=vector'
	},
	{
		label: 'Test (#vector)',
		delay: 1500,
		path: '/wiki/Test?useskin=vector'
	},
	{
		label: 'Test?action=History (#vector)',
		delay: 1500,
		path: '/w/index.php?title=Test&action=history&useskin=vector'
	},
	{
		label: 'Talk:Test (#vector)',
		delay: 1500,
		path: '/wiki/Talk:Test'
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

module.exports = configFactory( 'desktop', scenarios );
