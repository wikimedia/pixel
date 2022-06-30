const { performance } = require( 'perf_hooks' );

/**
 * Times how long a given callback that returns a promise takes to complete.
 *
 * @param {Function} callback
 */
async function benchmark( callback ) {
	const t0 = performance.now();

	await callback();

	const t1 = performance.now();
	const seconds = ( ( t1 - t0 ) / 1000 ).toFixed( 0 );
	console.log( `Finished in ${seconds} seconds` );
}

module.exports = benchmark;
