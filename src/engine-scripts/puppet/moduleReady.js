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
					// eslint-disable-next-line no-undef
					const debug = `codex=${mw.loader.getState( '@wikimedia/codex' )}vector=${mw.loader.getState( 'skins.vector.search' )}`;
					reject( `Cannot find module ${m} (${debug}). Is scenario setup with correct hashtags?` );
				}
				times++;
			}, 1000 );
		} );
	}, moduleName );
};
