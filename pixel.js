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

/**
 * @param {'test'|'reference'} type
 * @param {any} opts
 */
async function start( type, opts ) {
	try {
		// Start docker containers.
		await createSpawn( 'docker-compose', [ 'up', '-d' ] );
		// Execute main.js.
		await createSpawn(
			'docker-compose',
			[ 'exec', 'mediawiki', '/scripts/main.js', JSON.stringify( opts ) ]
		);
		// Execute Visual regression
		await createSpawn(
			'docker-compose',
			[ 'run', 'visual-regression', type, '--config', 'backstop.config.js' ]
		);

	} catch ( err ) {
		console.log( `Exited with code ${err}` );
	}

}

function setupCli() {
	const { program } = require( 'commander' );
	const branchOpt = /** @type {const} */ ( [
		'-b, --branch <name-of-branch>',
		'Name of branch. Can be `master` or a release branch (e.g. `origin/wmf/1.37.0-wmf.19`)',
		'master'
	] );
	const changeIdOpt = /** @type {const} */ ( [
		'-c, --change-id <Change-Id...>',
		'The Change-Id to use'
	] );

	program
		.name( 'pixel.js' )
		.description( 'Welcome to the pixel CLI to perform visual regression testing' );

	program
		.command( 'reference' )
		.description( 'Create reference (baseline) screenshots that your test snapshots will be compared against.' )
		.requiredOption( ...branchOpt )
		.option( ...changeIdOpt )
		.action( ( opts ) => {
			console.log( 'in reference', opts );
			start( 'reference', opts );
		} );

	program
		.command( 'test' )
		.description( 'Create test screenshots and compare them against the reference screenshots.' )
		.requiredOption( ...branchOpt )
		.option( ...changeIdOpt )
		.action( ( opts ) => {
			console.log( 'in test', opts );
			start( 'test', opts );
		} );

	program.parse();

}

setupCli();
