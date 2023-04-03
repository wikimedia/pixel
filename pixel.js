#!/usr/bin/env node
const util = require( 'util' );
const exec = util.promisify( require( 'child_process' ).exec );
const LATEST_RELEASE_BRANCH = 'latest-release';
const MAIN_BRANCH = 'master';
const BatchSpawn = require( './src/BatchSpawn' );
const batchSpawn = new BatchSpawn( 1 );
const fs = require( 'fs' );
const CONTEXT_PATH = `${__dirname}/context.json`;

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

let context;
if ( fs.existsSync( CONTEXT_PATH ) ) {
	context = JSON.parse( fs.readFileSync( CONTEXT_PATH ).toString() );
} else {
	context = {};
}

/**
 * @return {Promise<string>}
 */
async function getLatestReleaseBranch() {
	// Get the latest branch version that starts with a digit.
	const { stdout } = await exec( 'git ls-remote -h --sort="-version:refname" https://gerrit.wikimedia.org/r/mediawiki/core --patterns "refs/heads/wmf/[0-9]*" | head -1' );
	return `origin/${stdout.split( 'refs/heads/' )[ 1 ].trim()}`;
}

/**
 * @param {'test'|'reference'} type
 * @param {'mobile'|'desktop'|'desktop-dev'|'echo|campaign-events'} group
 * @param {string} relativePath Relative path to report.
 * @param {boolean} nonInteractive
 * @return {Promise<undefined>}
 */
async function openReportIfNecessary( type, group, relativePath, nonInteractive ) {
	const filePathFull = `${__dirname}/${relativePath}/index.html`;
	const markerString = '<div id="root">';
	try {
		if ( type === 'reference' ) {
			return;
		}
		const ctx = context[ group ];
		const date = new Date();
		const fileString = fs.readFileSync( filePathFull ).toString().replace(
			markerString,
			`<div id="mw-message-box" style="color: #000; box-sizing: border-box;
margin-bottom: 16px;border: 1px solid; padding: 12px 24px;
word-wrap: break-word; overflow-wrap: break-word; overflow: hidden;
background-color: #eaecf0; border-color: #a2a9b1;">
<h2>Test group: <strong>${group}</strong></h2>
<p>Comparing ${ctx.reference}${ctx.description} against ${ctx.test}.</p>
<p>Test ran on ${date}</p>
</div>
<script>
const daysElapsed = ( new Date() - new Date('${date}') ) / ( 1000 * 60 * 60 * 24);
if ( daysElapsed > 1 ) {
  document.getElementById( 'mw-messagebox' ).style.backgroundColor = 'red';
}
</script>
${markerString}`
		);
		fs.writeFileSync( filePathFull, fileString );
		if ( !nonInteractive ) {
			await batchSpawn.spawn( 'open', [ filePathFull ] );
		}
	} catch ( e ) {
		console.log( `Could not open report, but it is located at ${filePathFull}` );
	}
}

/**
 * @param {string} groupName
 * @return {string} path to configuration file.
 * @throws {Error} for unknown group
 */
const getGroupConfig = ( groupName ) => {
	switch ( groupName ) {
		case 'web-maintained':
			return 'configWebMaintained.js';
		case 'echo':
			return 'configEcho.js';
		case 'desktop-dev':
			return 'configDesktopDev.js';
		case 'desktop':
			return 'configDesktop.js';
		case 'mobile':
			return 'configMobile.js';
		case 'campaign-events':
			return 'configCampaignEvents.js';
		case 'codex':
			return 'configCodex.js';
		default:
			throw new Error( `Unknown test group: ${groupName}` );
	}
};

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
 * @param {string} relativePath Relative path to folder.
 */
function removeFolder( relativePath ) {
	fs.rmSync( `${__dirname}/${relativePath}`, { recursive: true, force: true } );
}

/**
 * @param {'test'|'reference'} type
 * @param {any} opts
 */
async function processCommand( type, opts ) {
	try {
		let active;
		let description = '';
		const group = opts.group;
		// Check if `-b latest-release` was used and, if so, set opts.branch to the
		// latest release branch.
		if ( opts.branch === LATEST_RELEASE_BRANCH ) {
			opts.branch = await getLatestReleaseBranch();
			console.log( `Using latest branch "${opts.branch}"` );
			if ( opts.changeId ) {
				description = ` (Includes ${opts.changeId.join( ',' )})`;
			}
			active = opts.branch;
		} else if ( opts.branch !== 'master' ) {
			active = opts.branch;
			if ( opts.changeId ) {
				description = ` (Includes ${opts.changeId.join( ',' )})`;
			}
		} else {
			active = opts.changeId ? opts.changeId[ 0 ] : opts.branch;
		}
		if ( !context[ group ] ) {
			context[ group ] = { description };
		}
		if ( type === 'reference' ) {
			context[ group ].description = description;
		}
		context[ group ][ type ] = active;
		// store details of this run.
		fs.writeFileSync( `${__dirname}/context.json`, JSON.stringify( context ) );
		const configFile = getGroupConfig( group );
		const config = require( `${__dirname}/${configFile}` );

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

		// Remove test screenshots folder (if present) so that its size doesn't
		// increase with each `test` run. BackstopJS automatically removes the
		// reference folder when the `reference` command is run, but not the test
		// folder when the `test` command is run.
		if ( type === 'test' ) {
			removeFolder( config.paths.bitmaps_test );
		}
		// Execute Visual regression tests.
		await batchSpawn.spawn(
			'docker',
			[ 'compose', ...getComposeOpts( [ 'run', ...( process.env.NONINTERACTIVE ? [ '--no-TTY' ] : [] ), '--rm', 'visual-regression', type, '--config', configFile ] ) ]
		).then( async () => {
			await openReportIfNecessary(
				type, group, config.paths.html_report, process.env.NONINTERACTIVE
			);
		}, async ( /** @type {Error} */ err ) => {
			if ( err.message.includes( '130' ) ) {
				// If user ends subprocess with a sigint, exit early.
				// eslint-disable-next-line no-process-exit
				process.exit( 1 );
			}

			if ( err.message.includes( 'Exit with error code 1' ) ) {
				await openReportIfNecessary(
					type, group, config.paths.html_report, process.env.NONINTERACTIVE
				);
				// eslint-disable-next-line no-process-exit
				process.exit( 1 );
			}

			throw err;
		} ).finally( async () => {
			// Reset the database if `--reset-db` option is passed.
			if ( opts.resetDb ) {
				console.log( 'Resetting database state...' );
				await resetDb();
			}
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
	const groupOpt = /** @type {const} */ ( [
		'-g, --group <(mobile|desktop|echo|campaign-events)>',
		'The group of tests to run. If omitted the group will be desktop.',
		'desktop'
	] );
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
		.option( ...groupOpt )
		.option( ...resetDbOpt )
		.action( ( opts ) => {
			processCommand( 'reference', opts );
		} );

	program
		.command( 'test' )
		.description( 'Create test screenshots and compare them against the reference screenshots.' )
		.requiredOption( ...branchOpt )
		.option( ...changeIdOpt )
		.option( ...groupOpt )
		.option( ...resetDbOpt )
		.action( ( opts ) => {
			processCommand( 'test', opts );
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
			// Git pull the latest.
			await batchSpawn.spawn(
				'git',
				[ '-C', __dirname, 'pull', 'origin', 'main' ]
			);
			// Install npm dependencies.
			await batchSpawn.spawn(
				'npm',
				[ 'i' ]
			);
			// Stops and removes Docker containers, networks, and volumes.
			await batchSpawn.spawn(
				'docker',
				[ 'compose', ...getComposeOpts( [ 'down', '--volumes', '--remove-orphans' ] ) ]
			);
			// Build or rebuild services.
			await batchSpawn.spawn(
				'docker',
				[ 'compose', ...getComposeOpts( [ 'build' ] ) ]
			);
			// Remove any dangling images.
			await batchSpawn.spawn(
				'docker',
				[ 'image', 'prune', '-f' ]
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
