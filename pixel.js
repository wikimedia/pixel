#!/usr/bin/env node
const util = require( 'util' );
const exec = util.promisify( require( 'child_process' ).exec );
const LATEST_RELEASE_BRANCH = 'latest-release';
const MAIN_BRANCH = 'master';
const SERVICES = [
	'mediawiki',
	'database',
	'visual-regression',
	'visual-regression-reporter'
];
const BatchSpawn = require( './src/BatchSpawn' );
const batchSpawn = new BatchSpawn( 1 );
const REPORT_ORIGIN = 'http://localhost:4000';
const packageJson = require( './package.json' );
const { program, Option } = require( 'commander' );
const pathResolve = require( 'path' ).resolve;
const fs = require( 'fs' );
// Use the presence of the package-lock.json file as a proxy for whether this
// script is running as part of a released package. The package-lock.json file
// is not specified in the `files` list in package.json so it will not exist in
// releases.
const IS_BUILD = !fs.existsSync( `${__dirname}/package-lock.json` );

/**
 * @return {Promise<string>}
 */
async function getLatestReleaseBranch() {
	const { stdout } = await exec( 'git ls-remote -h --sort="-version:refname" https://gerrit.wikimedia.org/r/mediawiki/core | head -1' );
	return `origin/${stdout.split( 'refs/heads/' )[ 1 ].trim()}`;
}

/**
 * @param {string} reportLocation
 */
async function copyReportToHost( reportLocation ) {
	try {
		// Save report to host at the location specified by `path`.
		await batchSpawn.spawn(
			'docker',
			[ 'compose', ...getComposeOpts( [ 'cp', 'visual-regression-reporter:/vrdata/pixel-report', reportLocation ] ) ]
		);
	} catch ( e ) {
		console.log( 'Could not copy report to host', e );
	}
}

/**
 * @param {'test'|'reference'} type
 * @param {string} group
 * @param {string} [path] Path that the report should be written.
 * @return {Promise<undefined>}
 */
async function openReportIfNecessary( type, group, path ) {
	const reportUrl = `${REPORT_ORIGIN}/${group}`;

	try {
		if ( type === 'reference' ) {
			return;
		}

		if ( path ) {
			path = pathResolve( path );
			copyReportToHost( pathResolve( path ) );
		}

		await batchSpawn.spawn( 'open', [ reportUrl ] );

		console.log( `Report located at ${reportUrl}${path ? ` and at ${path}` : ''}` );
	} catch ( e ) {
		console.log( `Could not open report, but it is located at ${reportUrl}` );
	}
}

/**
 * @param {string[]} opts
 * @return {string[]}
 */
function getComposeOpts( opts ) {
	return [
		'--project-directory', __dirname,
		'-f', `${__dirname}/docker-compose.yml`,
		'-f', IS_BUILD ? `${__dirname}/docker-compose.build.yml` : `${__dirname}/docker-compose.override.yml`,
		...opts
	];
}

/**
 * Removes all images, containers, networks, and volumes associated with Pixel.
 * This is mostly used if Pixel is throwing errors and you want a quick way to
 * reset everything and start Pixel with a fresh slate.
 *
 * @return {Promise}
 */
async function cleanCommand() {
	await Promise.all( [
		batchSpawn.spawn( 'docker', [ 'compose', ...getComposeOpts( [ 'down', '--rmi', 'all', '--volumes', '--remove-orphans' ] ) ] ),
		batchSpawn.spawn( 'docker', [ 'compose', ...getComposeOpts( [ '--profile', 'visual-regression', 'down', '--rmi', 'all', '--volumes', '--remove-orphans' ] ) ] ),
		batchSpawn.spawn( 'docker', [ 'image', 'prune', '-a', '--filter', 'label=project=@nicholasray/pixel', '-f' ] )
	] );
}

/**
 * @param {string[]} imageTags
 */
async function prepareVersion( imageTags ) {
	if ( imageTags.every( ( imageTag ) => imageTag === packageJson.version ) ) {
		// Images match package.json version so return early.
		return;
	}

	console.warn( `Docker images associated with ${packageJson.version} were not found. To prepare for this version, all previous data volumes, images, and containers will be removed in 5 seconds (abort with control-c)` );
	await new Promise( ( resolve ) => {
		setTimeout( resolve, 5000 );
	} );
	await cleanCommand();

	if ( !IS_BUILD ) {
		return Promise.all(
			[
				batchSpawn.spawn(
					'docker',
					[ 'compose', ...getComposeOpts( [ 'build' ] ) ]
				),
				batchSpawn.spawn(
					'docker',
					[ 'compose', ...getComposeOpts( [ '--profile', 'visual-regression', 'build' ] ) ]
				)
			]

		);
	}

}

/**
 * @param {any} opts
 */
async function processCommand( opts ) {
	try {
		// Check if `-b latest-release` was used and, if so, set opts.branch to the
		// latest release branch.
		if ( opts.branch === LATEST_RELEASE_BRANCH ) {
			opts.branch = await getLatestReleaseBranch();

			console.log( `Using latest release branch "${opts.branch}"` );
		}

		// Reset the database if `--reset-db` option is passed.
		if ( opts.resetDb ) {
			await batchSpawn.spawn(
				'docker',
				[ 'compose', ...getComposeOpts( [ 'stop', 'database' ] ) ]
			);

			await batchSpawn.spawn(
				'docker',
				[ 'compose', ...getComposeOpts( [ 'rm', '-f', 'database' ] ) ]
			);

			await batchSpawn.spawn(
				'docker',
				[ 'volume', 'rm', '-f', 'pixel_dbdata' ]
			);
		}

		const imageTags = ( await Promise.all( SERVICES.map( async ( service ) => {
			const imageId = ( await exec( `docker compose ${getComposeOpts( [ 'images', service, '-q' ] ).join( ' ' )}` ) ).stdout.trim();
			return ( imageId === '' ) ? '' : ( await exec( `docker image inspect ${imageId} -f "{{index .RepoTags 0}}"` ) ).stdout.split( ':' )[ 1 ].trim();
		} ) ) ).filter( ( imageTag ) => imageTag !== '' );

		// Prepare for new version if necessary.
		await prepareVersion( imageTags );

		// Start docker containers.
		await batchSpawn.spawn(
			'docker',
			[ 'compose', ...getComposeOpts( [ 'up', '-d', '--quiet-pull' ] ) ]
		);
		// Execute main.js.
		await batchSpawn.spawn(
			'docker',
			[ 'compose', ...getComposeOpts( [ 'exec', '-T', 'mediawiki', '/src/main.js', JSON.stringify( opts ) ] ) ]
		);
		// Execute Visual regression tests.
		await batchSpawn.spawn(
			'docker',
			[ 'compose', ...getComposeOpts( [ '--profile', 'visual-regression', 'run', '--rm', 'visual-regression', JSON.stringify( opts ) ] ) ]
		).then( async () => {
			await openReportIfNecessary( opts.type, opts.group, opts.output );
		}, async ( /** @type {Error} */ err ) => {
			if ( err.message.includes( '130' ) ) {
				// If user ends subprocess with a sigint, exit early.
				return;
			}

			if ( err.message === 'Exit with error code 1' ) {
				return openReportIfNecessary( opts.type, opts.group, opts.output );
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
	const branchOpt = /** @type {const} */ ( [
		'-b, --branch <name-of-branch>',
		`Name of branch. Can be "${MAIN_BRANCH}" or a release branch (e.g. "origin/wmf/1.39.0-wmf.10"). Use "${LATEST_RELEASE_BRANCH}" to use the latest wmf release branch.`,
		'master'
	] );
	const changeIdOpt = /** @type {const} */ ( [
		'-c, --change-id <Change-Id...>',
		'The Change-Id to use. Use multiple flags to use multiple Change-Ids (e.g. -c <Change-Id> -c <Change-Id>)'
	] );
	const groupOpt = new Option(
		'-g, --group <(mobile|desktop)>',
		'The group of tests to run. If omitted the group will be desktop.',
		'desktop'
	)
		.default( 'desktop' )
		.choices( [ 'mobile', 'desktop' ] );

	const resetDbOpt = /** @type {const} */ ( [
		'--reset-db',
		'Reset the database before running the test. This will permanently remove all data that is currently in the database.'
	] );

	program
		.name( 'pixel' )
		.version( packageJson.version, '-v, --version', 'output the version number' )
		.description( 'Welcome to the pixel CLI to perform visual regression testing' );

	program
		.command( 'reference' )
		.description( 'Create reference (baseline) screenshots and delete the old reference screenshots.' )
		.requiredOption( ...branchOpt )
		.option( ...changeIdOpt )
		.addOption( groupOpt )
		.option( ...resetDbOpt )
		.action( ( opts ) => {
			opts = Object.assign( {}, opts, { type: 'reference' } );

			processCommand( opts );
		} );

	program
		.command( 'test' )
		.description( 'Create test screenshots and compare them against the reference screenshots.' )
		.requiredOption( ...branchOpt )
		.option( ...changeIdOpt )
		.addOption( groupOpt )
		.option( ...resetDbOpt )
		.addOption(
			new Option(
				'-o, --output [path-to-report]',
				'Save static report to a given path. Defaults to the current working directory.',
				'pixel-report'
			).preset( './pixel-report' )
		)
		.action( ( opts ) => {
			opts = Object.assign( {}, opts, { type: 'test' } );

			processCommand( opts );
		} );

	program
		.command( 'stop' )
		.description( 'Stops all Docker containers associated with Pixel' )
		.action( async () => {
			await batchSpawn.spawn(
				'docker',
				[ 'compose', ...getComposeOpts( [ 'stop' ] ) ]
			);
		} );

	program
		.command( 'clean' )
		.description( 'Removes all containers, images, networks, and volumes associated with Pixel so that it can start with a clean slate. If Pixel is throwing errors, try running this command.' )
		.action( async () => {
			await cleanCommand();
		} );

	program.parse();
}

setupCli();
