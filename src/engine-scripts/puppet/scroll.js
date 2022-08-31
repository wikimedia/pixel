module.exports = async ( page ) => {
	await page.evaluate( () => {
		window.scrollBy( 0, window.innerHeight );
		return true;
	} );
	// wait for bolding of active section
	await page.waitForSelector( 'sidebar-toc-list-item-active' );
};
