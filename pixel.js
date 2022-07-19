#!/usr/bin/env node
const util = require( 'util' );
const exec = util.promisify( require( 'child_process' ).exec );
const LATEST_RELEASE_BRANCH = 'latest-release';
const MAIN_BRANCH = 'master';
const BatchSpawn = require( './src/BatchSpawn' );
const batchSpawn = new BatchSpawn( 1 );
const fs = require( 'fs' );
const CONTEXT_PATH = `${__dirname}/context.json`;

const BRANCH_OVERRIDES = {
	'origin/wmf/1.39.0-wmf.19': {
		desktop: '808059'
	},
	// WVUI=>Codex and layout changes
	'origin/wmf/1.39.0-wmf.21': {
		desktop: '4ab2b1b'
	}
};

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
	const { stdout } = await exec( 'git ls-remote -h --sort="-version:refname" https://gerrit.wikimedia.org/r/mediawiki/core | head -1' );
	return `origin/${stdout.split( 'refs/heads/' )[ 1 ].trim()}`;
}

/**
 * @param {'test'|'reference'} type
 * @param {'mobile'|'desktop'|'desktop-dev'|'echo'} group
 * @return {Promise<undefined>}
 */
async function openReportIfNecessary( type, group ) {
	const REPORT_PATH = `report/${group}/index.html`;
	const filePathFull = `${__dirname}/${REPORT_PATH}`;
	const markerString = '<div id="root">';
	try {
		if ( type === 'reference' ) {
			return;
		}
		const ctx = context[ group ];
		const fileString = fs.readFileSync( filePathFull ).toString().replace(
			markerString,
			`<div style="color: #000; box-sizing: border-box;
margin-bottom: 16px;border: 1px solid; padding: 12px 24px;
word-wrap: break-word; overflow-wrap: break-word; overflow: hidden;
background-color: #eaecf0; border-color: #a2a9b1;">
<h2>Test group: <strong>${group}</strong></h2>
<p>Comparing ${ctx.reference} against ${ctx.test}. ${ctx.description}</p>
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
 * @param {string} groupName
 * @param {'test'|'reference'} type
 * @return {string} path to configuration file.
 * @throws {Error} for unknown group
 */
const getGroupConfig = ( groupName, type ) => {
	switch ( groupName ) {
		case 'echo':
			return 'configEcho.js';
		case 'desktop-dev':
			return type === 'reference' ? 'configDesktopDev.js' : 'configDesktopDevTest.js';
		case 'desktop':
			return 'configDesktop.js';
		case 'mobile':
			return 'configMobile.js';
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
 * @param {'test'|'reference'} type
 * @param {any} opts
 */
async function processCommand( type, opts ) {
	try {
		let description = '';
		const group = opts.group;
		// Check if `-b latest-release` was used and, if so, set opts.branch to the
		// latest release branch.
		if ( opts.branch === LATEST_RELEASE_BRANCH ) {
			opts.branch = await getLatestReleaseBranch();
			console.log( `Using latest branch "${opts.branch}"` );

			let overrideChangeId = BRANCH_OVERRIDES[ opts.branch ] || {};
			overrideChangeId = overrideChangeId[ group ];
			if ( overrideChangeId && type === 'reference' ) {
				description = `(Fastforward of "${opts.branch}")`;
				opts.branch = 'master';
				opts.changeId = [ overrideChangeId ];
				console.log( `Using ${opts.changeId} (this branch has been fastforwarded due to expected visual changes)` );
			}
		}
		if ( !context[ group ] ) {
			context[ group ] = { description };
		}
		if ( type === 'reference' ) {
			context[ group ].description = description;
		}
		context[ group ][ type ] = opts.changeId ? opts.changeId[ 0 ] : opts.branch;
		// store details of this run.
		fs.writeFileSync( `${__dirname}/context.json`, JSON.stringify( context ) );
		const configFile = getGroupConfig( group, type );

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
		// Execute Visual regression tests.
		await batchSpawn.spawn(
			'docker',
			[ 'compose', ...getComposeOpts( [ 'run', '--rm', 'visual-regression', type, '--config', configFile ] ) ]
		).then( async () => {
			await openReportIfNecessary( type, group );
		}, async ( /** @type {Error} */ err ) => {
			if ( err.message.includes( '130' ) ) {
				// If user ends subprocess with a sigint, exit early.
				// eslint-disable-next-line no-process-exit
				process.exit( 1 );
			}

			if ( err.message.includes( 'Exit with error code 1' ) ) {
				await openReportIfNecessary( type, group );
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
		'-g, --group <(mobile|desktop|echo)>',
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
