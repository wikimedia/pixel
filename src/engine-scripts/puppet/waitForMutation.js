/* eslint-disable jsdoc/no-undefined-types */
/**
 * Wait until a DOM mutation has occured in the specified element.
 *
 * @param {import("playwright").Page} page
 * @param {string} selector
 * @param {MutationObserverInit} options
 */
async function waitForMutation( page, selector, options ) {
	// eslint-disable-next-line no-shadow
	return page.evaluate( async ( { selector, options } ) => {
		return new Promise( ( resolve, reject ) => {
			const timeoutId = setTimeout( () => {
				reject( `TimeoutError: waitForMutation for selector ${selector}: Timeout 30000ms exceeded.` );
			}, 30000 );
			const observer = new MutationObserver( () => {
				clearTimeout( timeoutId );
				observer.disconnect();
				resolve();
			} );

			const el = document.querySelector( selector );
			observer.observe( el, options );
		} );
	}, { selector, options } );
}

module.exports = waitForMutation;
