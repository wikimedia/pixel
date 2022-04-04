#!/usr/bin/env node

const spawn = require( 'child_process' ).spawn;

/**
 * @param {string} command
 * @param {string[]} args
 * @return {Promise}
 */
function createSpawn( command, args ) {
	return new Promise( ( resolve, reject ) => {
		const childProcess = spawn(
			command,
			args,
			{ stdio: 'inherit' }
		);

		childProcess.on( 'close', ( code ) => {
			if ( code === 0 ) {
				resolve( code );
				return;
			}

			reject( code );
		} );
	} );
}

async function init() {
	try {
		const args = process.argv.slice( 2 );
		// Start docker containers.
		await createSpawn( 'docker-compose', [ 'up', '-d' ] );
		// Execute main.js.
		await createSpawn(
			'docker-compose',
			[ 'exec', 'mediawiki', '/scripts/main.js', ...args ]
		);
		// Execute Visual regression
		await createSpawn(
			'docker-compose',
			[ 'run', 'visual-regression', args.includes( 'reference' ) ? 'reference' : 'test', '--config', 'backstop.config.js' ]
		);

	} catch ( err ) {
		console.log( `Exited with code ${err}` );
	}
}

init();
