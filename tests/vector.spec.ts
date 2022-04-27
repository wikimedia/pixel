import test, { expect } from '@playwright/test';
import jsReady from './util/jsReady';

const scenarios = [
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

for ( const scenario of scenarios ) {
	test( scenario.label, async ( { page } ) => {
		await page.goto( scenario.path );

		await new Promise<void>( ( resolve ) => {
			setTimeout( () => {
				resolve();
			}, 1500 );
		} );

		// Make sure the main skin JavaScript module has loaded.
		await jsReady( page );

		expect(
			await page.screenshot( { animations: 'disabled' } )
		).toMatchSnapshot();
	} );
}
