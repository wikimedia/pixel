module.exports = async ( page ) => {
	await page.evaluate( () => {
		window.scrollBy( 0, window.innerHeight );
		return true;
	} );
};
