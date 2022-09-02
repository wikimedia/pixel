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
				if ( times > 10 ) {
					reject( `Cannot find module ${m}. Is scenario setup with correct hashtags?` );
				}
				times++;
			}, 1000 );
		} );
	}, moduleName );
};
