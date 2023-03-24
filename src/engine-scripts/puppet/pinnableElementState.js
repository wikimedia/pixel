/**
 * Handles Vector-2022's pinnable elements
 *
 * @param {import('puppeteer').Page} page
 * @param {string[]} hashtags
 * @param {string} featureName
 */
module.exports = async ( page, hashtags, featureName ) => {
	const isLoggedIn = hashtags.includes( '#logged-in' );
	const isUnpinned = hashtags.includes( `#${featureName}-unpinned` );
	const isCurrentlyPinned = await page.evaluate( ( name ) => {
		return document.documentElement.classList.contains( `vector-feature-${name}-pinned-enabled` );
	}, featureName );

	// Pin all elements by default when logged in to ensure pinnable element state
	// is consistent between each test.
	// Only unpin when unpin hashtag is provided
	if ( isLoggedIn || featureName === 'toc' ) {
		if ( ( !isUnpinned && !isCurrentlyPinned ) || ( isUnpinned && isCurrentlyPinned ) ) {
			const buttonSelector = `#vector-${featureName} .vector-pinnable-header-${isUnpinned ? 'unpin' : 'pin'}-button`;
			await page.evaluate( ( selector ) => {
				const btn = document.querySelector( selector );
				// Only click the unpin/pin button if available and visible
				if ( btn && window.getComputedStyle( btn ).display !== 'none' ) {
					btn.click();
					// Reset focus to reduce flakiness
					document.activeElement.blur();
				}
			}, buttonSelector );
		}
	}
};
