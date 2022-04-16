#!/usr/bin/env node
const util = require( 'util' );
const exec = util.promisify( require( 'child_process' ).exec );
const LATEST_RELEASE_BRANCH = 'latest-release';
const MAIN_BRANCH = 'master';
const BatchSpawn = require( './src/batch-spawn' );
const batchSpawn = new BatchSpawn( 1 );

/**
 * @return {Promise<string>}
 */
async function getLatestReleaseBranch() {
	const { stdout } = await exec( 'git ls-remote -h --sort="-version:refname" https://gerrit.wikimedia.org/r/mediawiki/core | head -1' );
	return `origin/${stdout.split( 'refs/heads/' )[ 1 ].trim()}`;
}

/**
 * @param {'test'|'reference'} type
 * @return {Promise<undefined>}
 */
async function openReportIfNecessary( type ) {
	try {
		if ( type === 'reference' ) {
			return;
		}
		await batchSpawn.spawn( 'open', [ 'report/index.html' ] );
	} catch ( e ) {
		console.log( 'Could not open report, but it is located at report/index.html' );
	}
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
		await batchSpawn.spawn( 'docker-compose', [ 'up', '-d' ] );
		// Execute main.js.
		await batchSpawn.spawn(
			'docker-compose',
			[ 'exec', 'mediawiki', '/src/main.js', JSON.stringify( opts ) ]
		);
		// Execute Visual regression tests.
		await batchSpawn.spawn(
			'docker-compose',
			[ 'run', '--rm', 'visual-regression', type, '--config', 'config.js' ]
		).then( async () => {
			await openReportIfNecessary( type );
		}, async ( /** @type {Error} */ err ) => {
			if ( err.message.includes( '130' ) ) {
				// If user ends subprocess with a sigint, exit early.
				return;
			}

			if ( err.message.includes( 'Exit with error code 1' ) ) {
				return openReportIfNecessary( type );
			}

			throw err;
		} );
	} catch ( err ) {
		console.error( err );
		// eslint-disable-next-line no-process-exit
		process.exit( 1 );
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
