module.exports = async ( page ) => {
	await page.evaluate( () => {
		window.scroll( 0, 1500 );
		return true;
	} );
};
