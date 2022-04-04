#!/usr/bin/env node
const spawn = require( 'child_process' ).spawn;

/**
 * @param {string} command
 * @param {string[]} args
 * @return {Promise<number>}
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
async function processCommand( type, opts ) {
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
			[ 'run', '--rm', 'visual-regression', type, '--config', 'backstop.config.js' ]
		).finally( async () => {
			if ( type === 'test' ) {
				await createSpawn( 'open', [ 'app/backstop_data/html_report/index.html' ] );
			}
		} );

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
		.description( 'Create reference (baseline) screenshots and delete the old reference screenshots.' )
		.requiredOption( ...branchOpt )
		.option( ...changeIdOpt )
		.action( ( opts ) => {
			processCommand( 'reference', opts );
		} );

	program
		.command( 'test' )
		.description( 'Create test screenshots and compare them against the reference screenshots.' )
		.requiredOption( ...branchOpt )
		.option( ...changeIdOpt )
		.action( ( opts ) => {
			processCommand( 'test', opts );
		} );

	program.parse();
}

setupCli();
