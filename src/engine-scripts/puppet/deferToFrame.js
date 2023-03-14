/**
 * Helper method that resolves a Promise after the browser has performed a
 * specified number of repaints.
 *
 * Uses `requestAnimationFrame` under the hood to determine the next repaint.
 *
 * @param {import("puppeteer").Page} page
 * @param {number} frameCount The number of frames to wait before resolving the
 * promise.
 * @return {Promise}
 */
async function deferToFrame( page, frameCount ) {
	return page.evaluate( async ( count ) => {
		const f = async () => {
			return new Promise( ( resolve ) => {
				if ( count === 0 ) {
					resolve();
					return;
				}

				requestAnimationFrame( () => {
					count -= 1;
					resolve( f() );
				} );
			} );
		};

		return f();
	}, frameCount );
}

module.exports = deferToFrame;
