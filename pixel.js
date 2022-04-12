#!/usr/bin/env node
const spawn = require( 'child_process' ).spawn;
const util = require( 'util' );
const exec = util.promisify( require( 'child_process' ).exec );
const LATEST_RELEASE_BRANCH = 'latest-release';
const MAIN_BRANCH = 'master';

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
 * @return {Promise<string>}
 */
async function getLatestReleaseBranch() {
	const { stdout } = await exec( 'git ls-remote -h --sort="-version:refname" https://gerrit.wikimedia.org/r/mediawiki/core | head -1' );
	return `origin/${stdout.split( 'refs/heads/' )[ 1 ].trim()}`;
}

/**
 * @param {'test'|'reference'} type
 * @param {any} opts
 */
async function processCommand( type, opts ) {
	try {
		// Check if `-b latest-release` was used and, if so, set opts.branch to the
		// latest release branch.
		if ( opts.branch === LATEST_RELEASE_BRANCH ) {
			opts.branch = await getLatestReleaseBranch();

			console.log( `Using latest branch "${opts.branch}"` );
		}

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
			[ 'run', '--rm', 'visual-regression', type, '--config', 'config.js' ]
		).finally( async () => {
			if ( type === 'test' ) {
				await createSpawn( 'open', [ 'report/index.html' ] );
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
		`Name of branch. Can be "${MAIN_BRANCH}" or a release branch (e.g. "origin/wmf/1.37.0-wmf.19"). Use "${LATEST_RELEASE_BRANCH}" to use the latest wmf release branch.`,
		'master'
	] );
	const changeIdOpt = /** @type {const} */ ( [
		'-c, --change-id <Change-Id...>',
		'The Change-Id to use. Use multiple flags to use multiple Change-Ids (e.g. -c <Change-Id> -c <Change-Id>)'
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
