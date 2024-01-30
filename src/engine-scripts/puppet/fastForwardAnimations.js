/**
 * Fast forward the document's running animation(s) so that we don't have to
 * wait around for them to finish.
 *
 * Please note this will only work for animations that use css transitions or
 * the web animation api. It will NOT work for animations that manipulate the
 * DOM (e.g. altering the style attribute).
 *
 * @param {import("puppeteer").Page} page
 */
async function fastForwardAnimations( page ) {
	return page.evaluate( async () => {
		// Turn off jQuery animations.
		// eslint-disable-next-line no-undef
		$.fx.off = true;
		// Adapted from https://github.com/microsoft/playwright/blob/0a401b2d86a39df85e57ad30bcec9ef81618abd0/packages/playwright-core/src/server/screenshotter.ts#L174
		document.getAnimations().forEach( ( animation ) => {
			if ( animation.playbackRate === 0 || !animation.effect ) {
				return;
			}

			if ( Number.isFinite( animation.effect.getComputedTiming().endTime ) ) {
				animation.finish();
			} else {
				animation.cancel();
			}
		} );

		// Wait until the next frame before resolving.
		return new Promise( ( resolve ) => {
			requestAnimationFrame( () => {
				requestAnimationFrame( () => {
					resolve();
				} );
			} );
		} );
	} );
}

module.exports = fastForwardAnimations;
