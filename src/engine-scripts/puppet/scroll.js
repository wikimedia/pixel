module.exports = async ( page ) => {
	await page.evaluate( () => {
		window.scroll( 0, window.innerHeight * 2 );
		return true;
	} );
};
