#!/usr/bin/env node
const util = require( 'util' );
const exec = util.promisify( require( 'child_process' ).exec );
const LATEST_RELEASE_BRANCH = 'latest-release';
const MAIN_BRANCH = 'master';
const BatchSpawn = require( './src/BatchSpawn' );
const batchSpawn = new BatchSpawn( 1 );
const fs = require( 'fs' );
const REPORT_PATH = 'report/index.html';
const CONTEXT_PATH = `${__dirname}/context.json`;

let context;
if ( fs.existsSync( CONTEXT_PATH ) ) {
	context = JSON.parse( fs.readFileSync( CONTEXT_PATH ).toString() );
} else {
	context = {
		test: 'unknown',
		reference: 'unknown'
	};
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
 * @return {Promise<undefined>}
 */
async function openReportIfNecessary( type ) {
	const filePathFull = `${__dirname}/${REPORT_PATH}`;
	const markerString = '<div id="root">';
	try {
		if ( type === 'reference' ) {
			return;
		}
		const fileString = fs.readFileSync( filePathFull ).toString().replace(
			markerString,
			`<div style="color: #000; box-sizing: border-box;
margin-bottom: 16px;border: 1px solid; padding: 12px 24px;
word-wrap: break-word; overflow-wrap: break-word; overflow: hidden;
background-color: #eaecf0; border-color: #a2a9b1;">
<p>Comparing ${context.reference} against ${context.test}.</p>
<p>Test ran on ${new Date()}</p>
</div>
${markerString}`
		);
		fs.writeFileSync( filePathFull, fileString );
		await batchSpawn.spawn( 'open', [ REPORT_PATH ] );
	} catch ( e ) {
		console.log( `Could not open report, but it is located at ${REPORT_PATH}` );
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
		context[ type ] = opts.branch;
		// store details of this run.
		fs.writeFileSync( `${__dirname}/context.json`, JSON.stringify( context ) );

		// Start docker containers.
		await batchSpawn.spawn( 'docker-compose', [ 'up', '-d' ] );
		// Execute main.js.
		await batchSpawn.spawn(
			'docker-compose',
			[ 'exec', '-T', 'mediawiki', '/src/main.js', JSON.stringify( opts ) ]
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
