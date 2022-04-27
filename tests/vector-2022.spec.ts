import test, { expect, Page } from '@playwright/test';
import fastForwardAnimations from './util/fastForwardAnimations';
import jsReady from './util/jsReady';
import scroll from './util/scroll';

const scenarios = [
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
		path: '/wiki/Special:BlankPage',
		misMatchThreshold: 0.04
	},
	{
		label: 'Special:BlankPage (#vector-2022, #userMenu-open)',
		path: '/wiki/Special:BlankPage',
		misMatchThreshold: 0.04
	},
	{
		label: 'Special:RecentChanges (#vector-2022, no max width, #sidebar-closed)',
		path: '/wiki/Special:RecentChanges'
	},
	{
		label: 'Special:BlankPage with user menu open (#vector-2022, #logged-in, #userMenu-open)',
		path: '/wiki/Special:BlankPage',
		misMatchThreshold: 0.4
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
	}
];

/**
 * Handles opening or closing a menu.
 *
 * @param page
 * @param buttonSelector
 * @param isClosed
 */
async function menuState( page: Page, buttonSelector: string, isClosed: boolean ) {
	await page.waitForSelector( buttonSelector );

	await page.evaluate( ( [ selector, isExpectedClosed ] ) => {
		const btn = document.querySelector( selector as string ) as HTMLInputElement;
		const isCheckbox = btn.getAttribute( 'type' ) === 'checkbox';
		const checkbox = ( isCheckbox ?
			btn : document.getElementById( btn.getAttribute( 'for' ) ) ) as HTMLInputElement;
		const isOpen = checkbox.checked;

		const toggle = () => {
			if ( isCheckbox ) {
				btn.checked = !btn.checked;
			} else {
				btn.dispatchEvent(
					new Event( 'click' )
				);
			}
		};
		if ( isExpectedClosed && isOpen ) {
			toggle();
		} else if ( !isExpectedClosed && !isOpen ) {
			toggle();
		}

	}, [ buttonSelector, isClosed ] );

	// Vector-2022 menus currently have transition animations when opened.
	fastForwardAnimations( page );
}

/**
 * Open or close Vector-2022's user menu.
 *
 * @param page
 * @param hashtags
 */
async function userMenuState( page: Page, hashtags: string[] ) {
	const isOpen = hashtags.includes( '#userMenu-open' );
	const isClosed = hashtags.includes( '#userMenu-closed' );

	if ( !isOpen && !isClosed ) {
		return;
	}

	await menuState( page, '#p-personal-checkbox', isClosed );
}

/**
 * Open or close Vector-2022's sidebar.
 *
 * @param page
 * @param hashtags
 */
async function sidebarState( page: Page, hashtags: string[] ) {
	const isOpen = hashtags.includes( '#sidebar-open' );
	const isClosed = hashtags.includes( '#sidebar-closed' );

	if ( !isOpen && !isClosed ) {
		return;
	}

	await menuState( page, '#mw-sidebar-button', isClosed );
}

/**
 * @param page
 * @param hashtags
 */
async function scrollState( page: Page, hashtags: string[] ) {
	if ( hashtags.includes( '#scroll' ) ) {
		scroll( page );
	}
}

for ( const scenario of scenarios ) {
	const hashtags = scenario.label.match( /(#[^ ,)]*)/g ) || [];
	test.use( { storageState: hashtags.includes( '#logged-in' ) ? 'state.json' : undefined } );

	test( scenario.label, async ( { page } ) => {
		await page.goto( scenario.path );

		await scrollState( page, hashtags );
		await sidebarState( page, hashtags );
		await userMenuState( page, hashtags );

		// Make sure the main skin JavaScript module has loaded.
		await jsReady( page );

		expect(
			await page.screenshot()
		).toMatchSnapshot( { maxDiffPixelRatio: scenario.misMatchThreshold } );
	} );
}
