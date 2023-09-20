const clickBtn = require( './clickBtn' );
/**
 * Toggle Vector-2022's limited width button.
 *
 * @param {import('puppeteer').Page} page
 * @param {string[]} hashtags
 */
module.exports = async ( page, hashtags ) => {
	// limit width by default to ensure consistency between tests
	// Only disable when hashtag is provided
	const isDisabled = hashtags.includes( '#limited-width-disabled' );
	const isCurrentlyEnabled = await page.evaluate( () => {
		return document.documentElement.classList.contains( 'vector-feature-limited-width-clientpref-1' ) ||
			// For reference
			document.documentElement.classList.contains( 'vector-feature-limited-width-enabled' );
	} );

	if ( ( isDisabled && isCurrentlyEnabled ) || ( !isDisabled && !isCurrentlyEnabled ) ) {
		const limitedWidthButtonSelector = '.vector-limited-width-toggle';
		await page.waitForSelector( limitedWidthButtonSelector );
		clickBtn( page, limitedWidthButtonSelector, '.vector-feature-limited-width-clientpref-1' );

		// If we have disabled limited width a popup will show.
		// Make sure it gets dismissed before showing screenshot.
		if ( isCurrentlyEnabled ) {
			await page.waitForSelector( '.vector-popup-notification' );
			// Click the body to dismiss the notification.
			await page.evaluate( async () => {
				document.body.click();
			} );
		}
	}
};
