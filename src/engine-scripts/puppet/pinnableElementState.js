/**
 * Handles Vector-2022's pinnable elements
 *
 * @param {import('puppeteer').Page} page
 * @param {string[]} hashtags
 * @param {string} featureName
 */
module.exports = async ( page, hashtags, featureName ) => {
	const isPinned = hashtags.includes( `#${featureName}-pinned` );
	const isCurrentlyPinned = await page.evaluate( ( name ) => {
		return document.documentElement.classList.contains( `vector-feature-${name}-pinned-enabled` );
	}, featureName );

	// Avoid having to specify pinned/unpinned hashtags for every test case
	if ( isPinned !== isCurrentlyPinned ) {
		const buttonSelector = `#vector-${featureName} .vector-pinnable-header-${isPinned ? 'pin' : 'unpin'}-button`;
		await page.evaluate( ( selector ) => {
			const btn = document.querySelector( selector );
			// Only click the unpin/pin button if its visible
			if ( btn && window.getComputedStyle( btn ).display !== 'none' ) {
				btn.click();
				// Reset focus to reduce flakiness
				document.activeElement.blur();
			}
		}, buttonSelector );
	}
};
