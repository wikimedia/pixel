const moduleReady = require( './moduleReady' );

/**
 * Focuses the search input and types test
 *
 * @param {import('puppeteer').Page} page
 * @param {string[]} hashtags
 */
module.exports = async ( page, hashtags ) => {
	const isOffline = hashtags.includes( '#search-offline' );
	if ( isOffline ) {
		await page.setOfflineMode( true );
	}

	// Click toggle if necessary to reveal input
	const button = await page.waitForSelector( '.search-toggle' );
	await button.boxModel().then( async ( box ) => {
		// If bounding box is null then the button is hidden on the page.
		if ( box !== null ) {
			await button.click();
		}
	} );
	// Focus the server side rendered search to trigger the loading of Vue.
	await page.focus( 'input[name="search"]' );
	if ( isOffline ) {
		// type into the server side rendered input
		page.keyboard.type( 'test' );
		// Wait for the loader to display
		await page.waitForSelector( '.search-form__loader', {
			visible: true
		} );
	} else {
		// Wait for Vue to load.
		await moduleReady( page, 'vue' );
		// focus and type into the newly added input
		await page.focus( 'input[name="search"]' );
		await page.keyboard.type( 't' );
		await page.keyboard.type( 'est' );
		// Wait for a search result to display.
		await page.waitForSelector( '#searchform li a', {
			visible: true,
			timeout: 10000
		} );
	}
};
