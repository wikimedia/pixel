/**
 * @param {import('playwright').Page} page
 */
module.exports = async ( page ) => {
	await page.evaluate( () => {
		window.scrollBy( 0, window.innerHeight );
	} );
};
