const moduleReady = require( './moduleReady' );

const getSkinModuleFromHashtags = ( hashtags ) => {
	if ( hashtags.includes( '#minerva' ) ) {
		return 'skins.minerva.scripts';
	} else if ( hashtags.includes( '#vector' ) ) {
		return 'skins.vector.legacy.js';
	} else if ( hashtags.includes( '#timeless' ) ) {
		return 'skins.timeless.js';
	} else if ( hashtags.includes( '#vector-2022' ) ) {
		return 'skins.vector.js';
	} else if ( hashtags.includes( '#cologneblue' ) ) {
		// Webfonts updates languages in top right on CologneBlue.
		return 'ext.uls.webfonts';
	} else {
		return 'mediawiki.page.ready';
	}
};

/**
 * Returns a promise that resolves when the vector or vector-2022's main module
 * is ready.
 *
 * @param {import("playwright").Page} page
 * @param {Array} hashtags
 */
module.exports = async ( page, hashtags ) => {
	await moduleReady( page, getSkinModuleFromHashtags( hashtags ) );
	if ( hashtags.includes( 'quicksurvey' ) ) {
		await moduleReady( page, 'ext.quicksurveys.lib.vue' );
	}
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
