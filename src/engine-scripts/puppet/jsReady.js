module.exports = async (page) => {
	await page.emulateMediaFeatures([
		{ name: 'prefers-reduced-motion', value: 'reduce' },
	]);
	await page.evaluate( () => {
		window.dispatchEvent( new Event( 'resize' ) );
		const skin = mw.config.get( 'skin' );
		let moduleName;
		switch( skin ) {
			case 'vector-2022':
				moduleName = 'skins.vector.js';
				break;
			case 'vector':
				moduleName = 'skins.vector.legacy.js';
				break;
			default:
				return true;
		}
		return mw.loader.getState( moduleName ) === 'ready';
	});

	// wait for animation frame or two.
        // Wait until the next frame before resolving.
	await new Promise( resolve => {
	  requestAnimationFrame( () => {
	    requestAnimationFrame( () => {
	      resolve();
	    } );
	  } );
	} );
};
