#!/usr/bin/env node
const util = require( 'util' );
const exec = util.promisify( require( 'child_process' ).exec );
const LATEST_RELEASE_BRANCH = 'latest-release';
const MAIN_BRANCH = 'master';
const BatchSpawn = require( './src/BatchSpawn' );
const batchSpawn = new BatchSpawn( 1 );
const fs = require( 'fs' );
const CONTEXT_PATH = `${__dirname}/context.json`;
const makeReport = require( './src/makeReportIndex.js' );

/*
 * @param {string[]} opts
 * @return {string[]}
 */
function getComposeOpts( opts ) {
	return [
		'--progress', 'plain',
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
	await batchSpawn.spawn( 'docker', [ 'system', 'prune', '-af' ] );
}

let context;
if ( fs.existsSync( CONTEXT_PATH ) ) {
	try {
		context = JSON.parse( fs.readFileSync( CONTEXT_PATH ).toString() );
	} catch ( e ) {
		context = {};
	}
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
 * @return {Promise<string>}
 */
async function getLatestCodexVersion() {
	// Get the version tag with the highest number
	const { stdout } = await exec( 'git ls-remote -t --sort="-version:refname" https://gerrit.wikimedia.org/r/design/codex --patterns "refs/tags/v[0-9.]*" | head -1' );
	return `${stdout.split( 'refs/tags/' )[ 1 ].trim()}`;
}

/**
 * @param {'test'|'reference'} type
 * @param {'mobile'|'desktop'|'desktop-dev'|'echo|campaign-events'} group
 * @param {string} relativePath Relative path to report.
 * @param {boolean} nonInteractive
 * @return {Promise<undefined>}
 */
async function writeBannerAndOpenReportIfNecessary( type, group, relativePath, nonInteractive ) {
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
(function() {
const daysElapsed = ( new Date() - new Date('${date}') ) / ( 1000 * 60 * 60 * 24);
  const warning = document.createElement( 'em' );
  const msg = document.getElementById( 'mw-message-box' );
  warning.textContent = 'This test is < ' + Math.round( parseInt( daysElapsed, 10 ) ) + ' days old.';
  msg.appendChild( warning );
  if ( daysElapsed > 1 ) {
    msg.style.backgroundColor = 'red';
  }
}());
</script>
${markerString}`
		);
		fs.writeFileSync( filePathFull, fileString );
		if ( !nonInteractive ) {
			await batchSpawn.spawn( 'open', [ filePathFull ] );
		}
	} catch ( e ) {
		console.log( `Could not open report, but it is located at ${filePathFull}` );
		console.error( e );
	}
}

/**
 * Each group has an assigned priority based on how regular they need to run.
 * For suites with lots of test where code seldom changes priority 2 and 3 are
 * preferred. Feel free to modify these as development priorities shift.
 * Priority 1 - run every hour
 * Priority 2 - run every 12 hours
 * Priority 3 - run every 24 hours
 */
const GROUP_CONFIG = {
	login: {
		name: 'Login and sign up pages',
		priority: 3,
		config: 'configLogin.js'
	},
	'web-maintained': {
		name: 'Extensions and skins maintained by web team',
		priority: 3,
		config: 'configWebMaintained.js'
	},
	echo: {
		name: 'Echo badges',
		priority: 3,
		config: 'configEcho.js'
	},
	'desktop-dev': {
		name: 'Zebra Vector 2022 skin',
		priority: 3,
		config: 'configDesktopDev.js'
	},
	desktop: {
		name: 'Vector 2022 skin',
		priority: 1,
		config: 'configDesktop.js'
	},
	mobile: {
		name: 'Minerva and MobileFrontend',
		priority: 1,
		config: 'configMobile.js'
	},
	'campaign-events': {
		priority: 2,
		config: 'configCampaignEvents.js'
	},
	codex: {
		priority: 1,
		config: 'configCodex.js'
	},
	wikilambda: {
		priority: 2,
		config: 'configWikiLambda.js'
	}
};

const A11Y_GROUP_CONFIG = {
	desktop: {
		name: 'Vector 2022 accessibility',
		priority: 2,
		a11y: true,
		logResults: true,
		config: 'configDesktopA11y.js'
	},
	mobile: {
		name: 'Minerva and MobileFrontend accessibility',
		priority: 2,
		a11y: true,
		logResults: true,
		config: 'configMobileA11y.js'
	}
};

/**
 * @param {string} groupName
 * @param {boolean} a11y
 * @return {string} path to configuration file.
 * @throws {Error} for unknown group
 */
const getGroupConfig = ( groupName, a11y ) => {
	const c = a11y ? A11Y_GROUP_CONFIG[ groupName ] : GROUP_CONFIG[ groupName ];
	if ( !c ) {
		throw new Error( `Unknown test group: ${groupName}` );
	}
	return c.config;
};

/**
 * @param {string} relativePath Relative path to folder.
 */
function removeFolder( relativePath ) {
	fs.rmSync( `${__dirname}/${relativePath}`, { recursive: true, force: true } );
}

/**
 * @typedef {Object} CommandOptions
 * @property {string[]} [changeId]
 * @property {string} [branch]
 * @property {string[]} [repoBranch]
 * @property {string} group
 */

/**
 * @param {'test'|'reference'} type
 * @param {CommandOptions} opts
 * @param {boolean} [runSilently]
 */
async function processCommand( type, opts, runSilently = false ) {
	try {
		let active;
		let description = '';
		const group = opts.group;
		const configFile = getGroupConfig( group, opts.a11y );
		const config = require( `${__dirname}/${configFile}` );

		setEnvironmentFlagIfGroup( 'ENABLE_WIKILAMBDA', 'wikilambda', group );
		// Check if `-b latest-release` was used and, if so, set opts.branch to the
		// latest release branch.
		if ( opts.branch === LATEST_RELEASE_BRANCH ) {
			opts.branch = await getLatestReleaseBranch();
			const codexTag = await getLatestCodexVersion();
			opts.repoBranch = [ ...( opts.repoBranch ?? [] ), `design/codex:${codexTag}` ];
			console.log( `Using latest branch "${opts.branch}" (for Codex, "${codexTag}")` );
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
		if ( opts.repoBranch && opts.repoBranch.length > 0 ) {
			active += ` (with custom branches: ${opts.repoBranch.join( ', ' )})`;
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

		await batchSpawn.spawn(
			'docker',
			[ 'build', '--progress', 'plain', '-f', 'Dockerfile.base-regression', '-t', 'pixel-base-regression:latest', '.' ]
		);

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

		const { stdout } = await exec( './purgeParserCache.sh' );
		console.log( stdout );

		if ( opts.a11y ) {
			// Execute a11y regression tests.
			return batchSpawn.spawn(
				'docker',
				[ 'compose', ...getComposeOpts( [ 'run', ...( process.env.NONINTERACTIVE ? [ '--no-TTY' ] : [] ), '--rm', 'a11y-regression', type, configFile, !!opts.logResults ] ) ]
			).finally( async () => {
				// Reset the database if `--reset-db` option is passed.
				if ( opts.resetDb ) {
					console.log( 'Resetting database state...' );
					await batchSpawn.spawn( './reset-db.sh', [], { shell: true } );
				}
			} );
		} else {
			// Remove test screenshots folder (if present) so that its size doesn't
			// increase with each `test` run. BackstopJS automatically removes the
			// reference folder when the `reference` command is run, but not the test
			// folder when the `test` command is run.
			if ( type === 'test' ) {
				removeFolder( config.paths.bitmaps_test );
			}
			// Execute Visual regression tests.
			const finished = await batchSpawn.spawn(
				'docker',
				[ 'compose', ...getComposeOpts( [ 'run', ...( process.env.NONINTERACTIVE ? [ '--no-TTY' ] : [] ), '--rm', 'visual-regression', type, '--config', configFile ] ) ]
			).then( async () => {
				await writeBannerAndOpenReportIfNecessary(
					type, group, config.paths.html_report, runSilently || process.env.NONINTERACTIVE
				);
			}, async ( /** @type {Error} */ err ) => {
				console.error( err );
				// Don't check error message if caller asked us not to.
				if ( err.message.includes( '130' ) ) {
					// If user ends subprocess with a sigint, exit early.
					if ( !runSilently ) {
						// eslint-disable-next-line no-process-exit
						process.exit( 1 );
					}
				}

				if ( err.message.includes( 'Exit with error code 1' ) ) {
					await writeBannerAndOpenReportIfNecessary(
						type, group, config.paths.html_report, process.env.NONINTERACTIVE
					);
					if ( !runSilently ) {
						// eslint-disable-next-line no-process-exit
						process.exit( 1 );
					}
				}

				if ( runSilently ) {
					return Promise.resolve();
				} else {
					throw err;
				}
			} ).finally( async () => {
				// Reset the database if `--reset-db` option is passed.
				if ( opts.resetDb ) {
					console.log( 'Resetting database state...' );
					await batchSpawn.spawn( './reset-db.sh', [], { shell: true } );
				}
			} );
			return finished;
		}
	} catch ( err ) {
		console.error( err );
		// eslint-disable-next-line no-process-exit
		process.exit( 1 );
	}
}

function setEnvironmentFlagIfGroup( envVarName, soughtGroup, group ) {
	process.env[ envVarName ] = group === soughtGroup ? 'true' : 'false';
}

function setupCli() {
	const { program } = require( 'commander' );
	const a11yOpt = /** @type {const} */ ( [
		'-a, --a11y',
		'Run automated a11y tests in addition to visual regression.'
	] );
	const logResultsOpt = /** @type {const} */ ( [
		'-l, --logResults',
		'Log accessibility results to statsv.'
	] );
	const branchOpt = /** @type {const} */ ( [
		'-b, --branch <name-of-branch>',
		`Name of branch. Can be "${MAIN_BRANCH}" or a release branch (e.g. "origin/wmf/1.37.0-wmf.19"). Use "${LATEST_RELEASE_BRANCH}" to use the latest wmf release branch.`,
		'master'
	] );
	const changeIdOpt = /** @type {const} */ ( [
		'-c, --change-id <Change-Id...>',
		'The Change-Id to use. Use multiple flags to use multiple Change-Ids (e.g. -c <Change-Id> -c <Change-Id>)'
	] );
	const repoBranchOpt = /** @type {const} */ ( [
		'--repo-branch <repo:branch...>',
		'Override the branch name for a specific repository. Specify the repository name, then a colon, then the branch name, e.g. `mediawiki/skins/Vector:new-vector-features`. Use multiple flags to override branches for multiple repositories.'
	] );
	const groupOpt = /** @type {const} */ ( [
		'-g, --group <(mobile|desktop|echo|campaign-events)>',
		'The group of tests to run. If omitted the group will be desktop.',
		'desktop'
	] );
	const directoryOpt = /** @type {const} */ ( [
		'-d, --directory <path>',
		'Where to save the file',
		'report'
	] );
	const priorityOpt = /** @type {const} */ ( [
		'-p, --priority <number>',
		'Only run jobs which match the provided priority',
		'0'
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
		.option( ...a11yOpt )
		.option( ...logResultsOpt )
		.option( ...changeIdOpt )
		.option( ...repoBranchOpt )
		.option( ...groupOpt )
		.option( ...resetDbOpt )
		.action( ( opts ) => {
			processCommand( 'reference', opts );
		} );

	program
		.command( 'test' )
		.description( 'Create test screenshots and compare them against the reference screenshots.' )
		.requiredOption( ...branchOpt )
		.option( ...a11yOpt )
		.option( ...logResultsOpt )
		.option( ...changeIdOpt )
		.option( ...repoBranchOpt )
		.option( ...groupOpt )
		.option( ...resetDbOpt )
		.action( ( opts ) => {
			processCommand( 'test', opts );
		} );

	program
		.command( 'reset-db' )
		.description( 'Destroys all data in the database and resets it.' )
		.action( async () => {
			await batchSpawn.spawn( './reset-db.sh', [], { shell: true } );
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

	program
		.command( 'runAll' )
		.description( 'Runs all the registered tests and generates a report.' )
		.option( ...branchOpt )
		.option( ...changeIdOpt )
		.option( ...repoBranchOpt )
		.option( ...groupOpt )
		.option( ...priorityOpt )
		.option( ...directoryOpt )
		.option( ...resetDbOpt )
		.action( async ( opts ) => {
			let html = '';
			const priority = parseInt( opts.priority, 10 );
			const outputDir = opts.directory;
			if ( !fs.existsSync( outputDir ) ) {
				fs.mkdirSync( outputDir );
			}

			// Update keys in a11y group config to avoid duplicate group names
			const updatedA11yGroupConfig = {};
			for ( const key in A11Y_GROUP_CONFIG ) {
				updatedA11yGroupConfig[ key + '-a11y' ] = A11Y_GROUP_CONFIG[ key ];
			}

			const groups = { ...GROUP_CONFIG, ...updatedA11yGroupConfig };
			for ( const [ groupName, groupDef ] of Object.entries( groups ) ) {
				const group = groupDef.a11y ? groupName.slice( 0, -5 ) : groupName;
				const name = groupDef.name || group;
				html += `<li><a href="${groupName}/index.html">${name} (${groupName})</a></li>`;
				const groupPriority = groupDef.priority || 0;
				if ( groupPriority <= priority ) {
					console.log( `*************************
*************************
*************************
*************************
Running regression group "${groupName}"
*************************
*************************
*************************
*************************` );
					try {
						const changeId = opts.changeId;
						let msg = '';
						if ( changeId ) {
							msg = `(with ${changeId.join( ',' )}).`;
						}
						console.log( `Running reference group ${msg}` );
						await processCommand( 'reference', {
							branch: LATEST_RELEASE_BRANCH,
							changeId: opts.changeId,
							group,
							a11y: groupDef.a11y,
							logResults: groupDef.logResults
						}, true );
						await processCommand( 'test', {
							branch: 'master',
							group,
							a11y: groupDef.a11y,
							logResults: groupDef.logResults
						}, true );
					} catch ( e ) {
						// Continue.
						console.log( 'Error occurred' );
						console.error( e );
					}
				} else {
					console.log( `*************************
Skipping group "${groupName}" due to priority.
*************************` );
				}
			}
			const path = await makeReport( outputDir, html );
			if ( !process.env.NONINTERACTIVE ) {
				await batchSpawn.spawn( 'open', [ path ] );
			}
		} );
	program.parse();
}

setupCli();
