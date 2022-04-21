module.exports = async (page) => {
	await page.emulateMediaFeatures([
		{ name: 'prefers-reduced-motion', value: 'reduce' },
	]);
	await page.evaluate( async () => {
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

		// Poll the state of the module until it is ready.
		await new Promise((resolve) => {
			const id = setInterval(() => {
				if ( mw.loader.getState( moduleName ) === 'ready' ) {
					clearInterval( id );
					resolve(true);
				}
			}, 500 );
		});

		// Wait until the next frame before resolving. collapsibleTabs.js in Vector
		// and Vector-2022 make use of rAF.
		return new Promise( resolve => {
			requestAnimationFrame( () => {
				requestAnimationFrame( () => {
					resolve();
				} );
			} );
		} );

	});
};
