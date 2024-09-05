const clickBtn = require( './clickBtn' );
/**
 * Toggle Vector-2022's limited width button.
 *
 * @param {import('puppeteer').Page} page
 * @param {string[]} hashtags
 */
module.exports = async ( page, hashtags ) => {

	const isDisabled = hashtags.includes( '#limited-width-disabled' );
	const isExcluded = await page.evaluate( () => {
		return document.documentElement.classList.contains( 'vector-feature-limited-width-clientpref--excluded' );
	} );

	if ( isExcluded ) {
		// Cannot change on this page!
		if ( isDisabled ) {
			// eslint-disable-next-line no-undef
			mw.log.warn( 'Attempt to disable limited width on a page where you cannot change limited width.' );
		}
		return;
	}

	const isCurrentlyEnabled = await page.evaluate( () => {
		return document.documentElement.classList.contains( 'vector-feature-limited-width-clientpref-1' );
	} );

	if ( ( isDisabled && isCurrentlyEnabled ) || ( !isDisabled && !isCurrentlyEnabled ) ) {
		const suffix = isCurrentlyEnabled ? '0' : '1';
		const limitedWidthButtonSelector = `#skin-client-pref-vector-feature-limited-width-value-${suffix}`;
		const selectorAfterToggle = `.vector-feature-limited-width-clientpref-${suffix}`;
		await page.waitForSelector( limitedWidthButtonSelector );
		await clickBtn( page, limitedWidthButtonSelector, selectorAfterToggle );
	}
};
