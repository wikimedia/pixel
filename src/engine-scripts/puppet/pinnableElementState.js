/**
 * Check if a hash tag is presented for the pinned state.
 *
 * @param {string} name
 * @param {string[]} hashtags
 * @return {boolean}
 */
const hasNoPinHashTag = ( name, hashtags ) => {
	return !hashtags.includes( `#${name}-unpinned` ) ||
		!hashtags.includes( `#${name}-pinned` );
};

/**
 * Handles Vector-2022's pinnable elements
 *
 * @param {import('puppeteer').Page} page
 * @param {string[]} hashtags
 * @param {string} featureName
 */
const setPinnedStatus = async ( page, hashtags, featureName ) => {
	const isUnpinned = hashtags.includes( `#${featureName}-unpinned` );
	const isCurrentlyPinned = await page.evaluate( ( name ) => {
		const classList = document.documentElement.classList;
		return classList.contains( `vector-feature-${name}-pinned-clientpref-1` ) ||
			classList.contains( `vector-feature-${name}-pinned-enabled` );
	}, featureName );

	// Only unpin when unpin hashtag is provided
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
};

/**
 * Handles Vector-2022's pinnable elements
 *
 * @param {import('puppeteer').Page} page
 * @param {string[]} hashtags
 * @param {string[]} features
 */
module.exports = async ( page, hashtags, features ) => {
	await features.forEach( async ( name ) => {
		// Pin all elements by default when logged in to ensure pinnable element state
		// is consistent between each test.
		// Only unpin when unpin hashtag is provided
		if ( !hasNoPinHashTag( name, hashtags ) ) {
			hashtags.push( `#${name}-pinned` );
		}
		await setPinnedStatus( page, hashtags, name );
	} );
};
