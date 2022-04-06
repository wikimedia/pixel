#!/usr/bin/env node

const spawn = require( 'child_process' ).spawn;
const util = require( 'util' );
const exec = util.promisify( require( 'child_process' ).exec );

/**
 * @param {string} command
 * @param {string[]} args
 * @param {any} opts
 * @return {Promise<number>}
 */
function createSpawn( command, args, opts ) {
	return new Promise( ( resolve, reject ) => {
		const childProcess = spawn(
			command,
			args,
			{ stdio: 'inherit', ...opts }
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
 * @param {any} opts
 */
async function processCommand( opts ) {
	// Start docker containers.
	await createSpawn( 'docker-compose', [ '-p', opts.name, 'up', '-d' ], { env: { ...process.env, MW_DOCKER_PORT: opts.port } } );
	// Execute main.js.
	await createSpawn(
		'docker-compose',
		[ '-p', opts.name, 'exec', 'mediawiki', '/scripts/main.js', JSON.stringify( opts ) ]
	);
}

/**
 * @return {Promise<string>}
 */
async function getReleaseBranch() {
	const response = await exec( 'git ls-remote -h --sort="-version:refname" https://gerrit.wikimedia.org/r/mediawiki/core | HEAD -1' );
	return `origin/${response.split( 'refs/heads/' )[ 1 ]}`;
}

async function setupCli() {
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
		.name( 'delta.js' )
		.description( 'Welcome to the delta CLI to launch one or more MediaWiki instances.' );

	program
		.command( 'up' )
		.description( 'Creates a new MediaWiki instance.' )
		.requiredOption( '-p, --port <port>', 'The port that the server can be accessed.', '3000' )
		.requiredOption( '-n, --name <name-of-instance>', 'The unique name prefix the containers will be assigned.', 'delta' )
		.requiredOption( ...branchOpt )
		.option( ...changeIdOpt )
		.action( ( opts ) => {
			processCommand( 'reference', opts );
		} );

	program
		.command( 'master:change' )
		.description( 'Create two instances of MediaWiki. One will be on origin/master and the other one will have one or more changes on top.' )
		.requiredOption( ...changeIdOpt )
		.action( async ( opts ) => {
			await processCommand( { ...opts, name: 'master', branch: 'master', port: 2999 } );
			await processCommand( { ...opts, name: 'change', port: 3000 } );
		} );

	program
		.command( 'release:change' )
		.description( 'Create two instances of MediaWiki. One will have the latest release branch and the other one will have one or more changes on top.' )
		.requiredOption( ...changeIdOpt )
		.action( async ( opts ) => {
			const latestBranch = await getReleaseBranch();

			await processCommand( { ...opts, name: 'release', branch: latestBranch, port: 2999 } );
			await processCommand( { ...opts, name: 'change', port: 3000 } );
		} );

	program.parse();
}

setupCli();
