const waitForIdle = require( './waitForIdle' );

/**
 * @param {import('puppeteer').Page} page
 * @param {import('backstopjs').Scenario} scenario
 */
module.exports = async ( page, scenario ) => {
	console.log( 'SCENARIO > ' + scenario.label );

	// Add CSS that disables all animations
	await page.evaluate( () => {
		const styleNode = document.createElement( 'style' );
		// Technically this delays the start of all animations for 2 hours and 46 minutes,
		// but our tests shouldn't take long enough for that to matter
		styleNode.innerText = '* { animation-delay: 9999s !important; }';
		document.head.appendChild( styleNode );
	} );

	// Wait for any images to finish loading.
	await page.waitForNetworkIdle();
	// Wait for the main thread to have an idle period.
	await waitForIdle( page );
};
