module.exports = async ( page, moduleName ) => {
	await page.evaluate( async ( m ) => {
		await new Promise( ( resolve ) => {
			const id = setInterval( () => {
				// eslint-disable-next-line no-undef
				if ( mw.loader.getState( m ) === 'ready' ) {
					clearInterval( id );
					resolve( true );
				}
			}, 500 );
		} );
	}, moduleName );
};
