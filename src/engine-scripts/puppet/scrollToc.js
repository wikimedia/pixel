module.exports = async ( page ) => {
	await page.evaluate( () => {
		const tocElement = document.getElementById( 'vector-toc' );
		const tocToggleBtns = tocElement.querySelectorAll( '.vector-toc-toggle' );
		for ( const btn of tocToggleBtns ) {
			btn.click();
		}
		tocElement.scrollBy( 0, tocElement.scrollHeight );
		// Scroll up 30px from the bottom of the TOC to allow the scrollable indicator to show
		tocElement.scrollBy( 0, -30 );
		return true;
	} );
};
