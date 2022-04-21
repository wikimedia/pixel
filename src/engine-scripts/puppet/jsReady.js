module.exports = async (page) => {
	await page.emulateMediaFeatures([
		{ name: 'prefers-reduced-motion', value: 'reduce' },
	]);
	await page.evaluate( () => {
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
		return new Promise((resolve) => {
			setInterval(() => {
				if ( mw.loader.getState( moduleName ) === 'ready' ) {
					resolve(true);
				}
			}, 500 );
		});
	});

	// Wait until the next frame before resolving.
	await page.evaluate( () => {
		return new Promise( resolve => {
			requestAnimationFrame( () => {
				requestAnimationFrame( () => {
					resolve();
				} );
			} );
		} );
	} );
};
