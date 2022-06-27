/**
 * Runs after onReady event on all scenarios -- use for simulating interactions.
 *
 * @param {import('puppeteer').Page} page
 * @param {import('backstopjs').Scenario} scenario
 */
module.exports = async ( page, scenario ) => {
	console.log( 'SCENARIO > ' + scenario.label );
	const label = scenario.label;
	const hashtags = label.match( /(#[^ ,)]*)/g ) || [];

	if ( hashtags.includes( '#scroll' ) ) {
		require( './scroll.js' )( page );
	}

	// These only apply to Vector 2022
	if ( hashtags.includes( '#vector-2022' ) ) {
		await require( './sidebarState' )( page, hashtags );
		await require( './userMenuState' )( page, hashtags );
	}

	// These only apply to Minerva
	if ( hashtags.includes( '#minerva' ) ) {
		await require( './minerva/mainMenuState' )( page, hashtags );
	}

	// Make sure the main skin JavaScript module has loaded.
	await require( './jsReady' )( page, hashtags );

	// Run Echo handlers if necessary.
	if ( hashtags.includes( '#echo' ) ) {
		await require( './echo.js' )( page, hashtags );
	}

	if ( hashtags.includes( '#search-focus' ) ) {
		await require( './search.js' )( page, hashtags );
	}

	if ( hashtags.includes( '#toc-open') ) {
		await require( './menuState' )( page, '#vector-toc-collapsed-button', false )
	}
	// add more ready handlers here...
};
