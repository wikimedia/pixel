/**
 * Wait until the browser's main thread has an "idle" period [1] before
 * continuing.
 *
 * [1] https://developer.mozilla.org/en-US/docs/Web/API/Window/requestIdleCallback
 *
 * @param {import("puppeteer").Page} page
 */
async function waitForIdle( page ) {
	return page.evaluate( async () => {
		return new Promise( ( resolve ) => {
			requestIdleCallback( () => {
				resolve();
			}, {
				timeout: 500
			} );
		} );
	} );
}

module.exports = waitForIdle;
