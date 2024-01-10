module.exports = async ( page ) => {
	await page.evaluate( () => {
		window.scroll( 0, window.innerHeight );
		return true;
	} );
};
