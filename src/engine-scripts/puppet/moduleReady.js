module.exports = async ( page, moduleName ) => {
	await page.evaluate( async ( m ) => {
		let times = 0;
		await new Promise( ( resolve, reject ) => {
			const id = setInterval( () => {
				// eslint-disable-next-line no-undef
				if ( mw.loader.getState( m ) === 'ready' ) {
					clearInterval( id );
					resolve();
				}
				if ( times > 5 ) {
					reject( 'Cannot find module. Is scenario setup with correct hashtags? ' +  mw.loader.getState( m ) );
				}
				times++;
			}, 500 );
		} );
	}, moduleName );
};
