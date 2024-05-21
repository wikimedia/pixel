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
	const isAppearanceEnabled = await page.evaluate( () => {
		return document.documentElement.classList.contains( 'vector-feature-appearance-enabled' );
	} );

	if ( isAppearanceEnabled ) {
		// FIXME: Handle limited width with client pref menu instead
		return;
	}

	const isDisabled = hashtags.includes( '#limited-width-disabled' );
	const isExcluded = await page.evaluate( () => {
		return document.documentElement.classList.contains( 'vector-feature-limited-width-clientpref--excluded' );
	} );

	if ( isExcluded ) {
		// Cannot change on this page!
		if ( isDisabled ) {
			mw.log.warn( 'Attempt to disable limited width on a page where you cannot change limited width.' );
		}
		return;
	}

	const isCurrentlyEnabled = await page.evaluate( () => {
		return document.documentElement.classList.contains( 'vector-feature-limited-width-clientpref-1' );
	} );

	if ( ( isDisabled && isCurrentlyEnabled ) || ( !isDisabled && !isCurrentlyEnabled ) ) {
		const limitedWidthButtonSelector = '.vector-limited-width-toggle';
		const selectorAfterToggle = `.vector-feature-limited-width-clientpref-${isCurrentlyEnabled ? '0' : '1'}`;
		await page.waitForSelector( limitedWidthButtonSelector );
		await clickBtn( page, limitedWidthButtonSelector, selectorAfterToggle );

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
