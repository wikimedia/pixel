#!/usr/bin/env node
const util = require( 'util' );
const exec = util.promisify( require( 'child_process' ).exec );
const LATEST_RELEASE_BRANCH = 'latest-release';
const MAIN_BRANCH = 'master';
const IMAGES = [
	'ghcr.io/nicholasray/pixel_mediawiki',
	'ghcr.io/nicholasray/pixel_database',
	'ghcr.io/nicholasray/pixel_visual-regression'
];
const BatchSpawn = require( './src/BatchSpawn' );
const batchSpawn = new BatchSpawn( 1 );
const REPORT_ORIGIN = 'http://localhost:4000';
const packageJson = require( './package.json' );
const { program, Option } = require( 'commander' );
const resolve = require( 'path' ).resolve;
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
			[ 'compose', ...getComposeOpts( [ 'cp', 'visual-regression:/vrdata/pixel-report', reportLocation ] ) ]
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
			path = resolve( path );
			copyReportToHost( resolve( path ) );
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

		// Check if required images with the same tag as the package.json are found.
		// If not, then pull the latest images and remove the database volume.
		if ( IS_BUILD ) {
			try {
				await Promise.all( IMAGES.map( ( image ) => {
					return exec( `docker image inspect ${image}:${packageJson.version}` );
				} ) );
			} catch ( e ) {
				if ( !e.message.includes( 'No such image' ) ) {
					throw e;
				}

				console.log( 'Docker images associated with this version were not found. To prepare for the new version, any existing database volumes, images, and containers will now be removed.' );
				await batchSpawn.spawn( 'docker', [ 'compose', ...getComposeOpts( [ 'down', '--rmi', 'all', '--volumes', '--remove-orphans' ] ) ] );
				await batchSpawn.spawn( 'docker', [ 'image', 'prune', '-a', '--filter', 'label=project=@nicholasray/pixel', '-f' ] );
			}
		}

		// Start docker containers.
		await batchSpawn.spawn(
			'docker',
			[ 'compose', ...getComposeOpts( [ 'up', '-d', ...( IS_BUILD ? [ '--quiet-pull' ] : [] ) ] ) ]
		);
		// Execute main.js.
		await batchSpawn.spawn(
			'docker',
			[ 'compose', ...getComposeOpts( [ 'exec', '-T', 'mediawiki', '/src/main.js', JSON.stringify( opts ) ] ) ]
		);
		// Execute Visual regression tests.
		await batchSpawn.spawn(
			'docker',
			[ 'compose', ...getComposeOpts( [ 'exec', 'visual-regression', '/pixel/src/runTests.js', JSON.stringify( opts ) ] ) ]
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

	program.parse();
}

setupCli();
