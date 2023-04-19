module.exports = async ( page, moduleName ) => {
	await page.evaluate( async ( m ) => {
		let times = 0;
		await new Promise( ( resolve, reject ) => {
			if ( !window.mw || !window.mw.loader || !window.mw.loader.getState ) {
				reject( 'mw.loader.getState is undefined. This is likely the result of a server error. The page\'s HTML is: \n' + document.documentElement.outerHTML );
				return;
			}
			const id = setInterval( () => {
				// eslint-disable-next-line no-undef
				if ( mw.loader.getState( m ) === 'ready' ) {
					clearInterval( id );
					resolve();
					return;
				}
				if ( times > 10 ) {
					// eslint-disable-next-line no-undef
					const debug = `codex=${mw.loader.getState( '@wikimedia/codex' )}, ${moduleName}=${mw.loader.getState( moduleName )}`;
					reject( `Cannot find module ${m} (${debug}). Is scenario setup with correct hashtags?` );
					return;
				}
				times++;
			}, 1000 );
		} );
	}, moduleName );
};
