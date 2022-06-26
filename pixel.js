#!/usr/bin/env node
const { program, Option } = require( 'commander' );
const util = require( 'util' );
const exec = util.promisify( require( 'child_process' ).exec );
const LATEST_RELEASE_BRANCH = 'latest-release';
const MAIN_BRANCH = 'master';
const BatchSpawn = require( './src/BatchSpawn' );
const batchSpawn = new BatchSpawn( 1 );
const fs = require( 'fs' );
const groups =
	fs.readdirSync( __dirname, { withFileTypes: true } )
		.filter( ( file ) => {
			if ( file.isDirectory() ) {
				return false;
			}

			const regex = new RegExp( /^config.+\.js$/ );
			return regex.test( file.name );
		} )
		.map( ( file ) => {
			const name = file.name
				.split( 'config' )[ 1 ]
				.split( '.' )[ 0 ];

			return name.charAt( 0 ).toLowerCase() + name.slice( 1 );
		} );

/*
 * @param {string[]} opts
 * @return {string[]}
 */
function getComposeOpts( opts ) {
	return [
		'--project-directory', __dirname,
		'-f', `${__dirname}/docker-compose.yml`,
		...opts
	];
}

/**
 * Removes all images, containers, networks, and volumes associated with Pixel.
 * This will often be used after updates to the Docker images and/or volumes and
 * will reset everything so that Pixel starts with a clean slate.
 *
 * @return {Promise}
 */
async function cleanCommand() {
	await batchSpawn.spawn( 'docker', [ 'compose', ...getComposeOpts( [ 'down', '--rmi', 'all', '--volumes', '--remove-orphans' ] ) ] );
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
 * @param {string} group
 * @return {Promise<undefined>}
 */
async function openReportIfNecessary( type, group ) {
	const REPORT_PATH = group === 'all' ? `${__dirname}/report/index.html` : `${__dirname}/report/${group}/index.html`;
	try {
		if ( type === 'reference' ) {
			return;
		}

		await batchSpawn.spawn( 'open', [ REPORT_PATH ] );
	} catch ( e ) {
		console.log( `Could not open report, but it is located at ${REPORT_PATH}` );
	}
}

/**
 * Resets the database to the physical backup downloaded from the
 * Dockerfile.database docker image.
 */
async function resetDb() {
	// Mysql server needs to be shutdown before restoring a physical backup:
	// See: https://www.percona.com/doc/percona-xtrabackup/2.1/xtrabackup_bin/restoring_a_backup.html
	await batchSpawn.spawn(
		'docker',
		[ 'compose', ...getComposeOpts( [ 'stop', 'database' ] ) ]
	);

	// Run seedDb.sh script which rsyncs the physical backup into the mysql folder.
	await batchSpawn.spawn(
		'docker',
		[ 'compose', ...getComposeOpts( [ 'run', '--rm', '--entrypoint', 'bash -c "/docker-entrypoint-initdb.d/seedDb.sh"', 'database' ] ) ]
	);

	// Start mysql server.
	await batchSpawn.spawn(
		'docker',
		[ 'compose', ...getComposeOpts( [ 'up', '-d', 'database' ] ) ]
	);
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

			console.log( `Using latest branch "${opts.branch}"` );
		}

		// Start docker containers.
		await batchSpawn.spawn(
			'docker',
			[ 'compose', ...getComposeOpts( [ 'up', '-d' ] ) ]
		);

		// Execute main.js. Pass the `-T` flag if the `NONINTERACTIVE` env variable
		// is set. This might be needed when Pixel is running inside a cron job, for
		// example.
		await batchSpawn.spawn(
			'docker',
			[ 'compose', ...getComposeOpts( [ 'exec', ...( process.env.NONINTERACTIVE ? [ '-T' ] : [] ), 'mediawiki', '/src/main.js', JSON.stringify( opts ) ] ) ]
		);

		// Execute Visual regression tests for each test group.
		const queue = opts.group === 'all' ? [ ...groups ] : [ opts.group ];
		const errors = [];
		while ( queue.length ) {
			const group = queue.shift();

			try {
				await batchSpawn.spawn(
					'docker',
					[ 'compose', ...getComposeOpts(
						[ 'run', '--rm', 'visual-regression', JSON.stringify( { ...opts, group } ) ]
					) ]
				)
					.finally( async () => {
						// Reset the database if `--reset-db` option is passed.
						if ( opts.resetDb ) {
							console.log( 'Resetting database state...' );
							await resetDb();
						}
					} );

			} catch ( e ) {
				if ( e instanceof Error && e.message.includes( '130' ) ) {
					// If user ends subprocess with a sigint, exit early.
					// eslint-disable-next-line no-process-exit
					process.exit( 1 );
				}

				// When running multiple groups, we don't want one group's failure to
				// cause downstream groups to fail. Therefore, store the errors in an
				// array but continue running test groups.
				errors.push( e );
			}
		}

		await openReportIfNecessary( opts.type, opts.group );
		// eslint-disable-next-line no-process-exit
		process.exit( errors.length ? 1 : 0 );

	} catch ( err ) {
		console.error( err );
		// eslint-disable-next-line no-process-exit
		process.exit( 1 );
	}
}

function setupCli() {
	const branchOpt = /** @type {const} */ ( [
		'-b, --branch <name-of-branch>',
		`Name of branch. Can be "${MAIN_BRANCH}" or a release branch (e.g. "origin/wmf/1.37.0-wmf.19"). Use "${LATEST_RELEASE_BRANCH}" to use the latest wmf release branch.`,
		'master'
	] );
	const changeIdOpt = /** @type {const} */ ( [
		'-c, --change-id <Change-Id...>',
		'The Change-Id to use. Use multiple flags to use multiple Change-Ids (e.g. -c <Change-Id> -c <Change-Id>)'
	] );
	const groupOpt = new Option(
		'-g, --group <group-name>',
		'The group of tests to run. If omitted the group will be desktop.',
		'desktop'
	)
		.default( 'desktop' )
		.choices( [ 'all', ...groups ] );
	const resetDbOpt = /** @type {const} */ ( [
		'--reset-db',
		'Reset the database after running a test group. This will destroy all data that is currently in the database.'
	] );

	program
		.name( 'pixel.js' )
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
		.action( ( opts ) => {
			opts = Object.assign( {}, opts, { type: 'test' } );

			processCommand( opts );
		} );

	program
		.command( 'reset-db' )
		.description( 'Destroys all data in the database and resets it.' )
		.action( async () => {
			await resetDb();
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
		.command( 'update' )
		.description( 'Updates Pixel to the latest version. This command also destroys all containers, images, networks, and volumes associated with Pixel to ensure it is using the latest code.' )
		.action( async () => {
			await batchSpawn.spawn(
				'git',
				[ '-C', __dirname, 'fetch', '-u', 'origin', 'main:main' ]
			);
			await cleanCommand();
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
