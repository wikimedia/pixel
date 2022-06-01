const moduleReady = require( './moduleReady' );

const getSkinModuleFromHashtags = ( hashtags ) => {
	if ( hashtags.includes( '#minerva' ) ) {
		return 'skins.minerva.scripts';
	} else if ( hashtags.includes( '#vector' ) ) {
		return 'skins.vector.legacy.js';
	} else {
		return 'skins.vector.js';
	}
};

/**
 * Returns a promise that resolves when the vector or vector-2022's main module
 * is ready.
 *
 * @param {import("puppeteer").Page} page
 * @param {Array} hashtags
 */
module.exports = async ( page, hashtags ) => {
	await moduleReady( page, getSkinModuleFromHashtags( hashtags ) );
	await page.evaluate( () => {
		// Wait until the next frame before resolving. collapsibleTabs.js in Vector
		// and Vector-2022 make use of rAF.
		return new Promise( ( resolve ) => {
			requestAnimationFrame( () => {
				requestAnimationFrame( () => {
					resolve();
				} );
			} );
		} );

	} );
};
