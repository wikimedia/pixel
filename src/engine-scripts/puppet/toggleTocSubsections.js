/**
 * @param {import('playwright').Page} page
 */
module.exports = async ( page ) => {
	await page.evaluate( () => {
		const tocElement = document.getElementById( 'vector-toc' );
		const tocToggleBtns = tocElement.querySelectorAll( '.vector-toc-toggle' );
		for ( const btn of tocToggleBtns ) {
			btn.click();
		}
	} );
};
