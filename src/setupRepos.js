#!/usr/bin/env node

const { performance } = require( 'perf_hooks' );
const CORE_GIT = 'https://gerrit.wikimedia.org/r/mediawiki/core.git';
const CORE_NAME = 'mediawiki/core';
const BatchSpawn = require( './BatchSpawn' );
const util = require( 'util' );
const exec = util.promisify( require( 'child_process' ).exec );

/**
 * @param {BatchSpawn} batchSpawn
 * @param {string} repositoryJson JSON string of repositories
 */
async function setupRepos( batchSpawn, repositoryJson ) {
	const repositories = JSON.parse( repositoryJson );
	delete repositories[ CORE_NAME ];

	await Promise.all( Object.keys( repositories ).map( ( id ) => {
		const path = repositories[ id ].path;
		return batchSpawn.spawn(
			`
			git clone https://gerrit.wikimedia.org/r/${id} ${path}
			git -C "${path}" checkout --quiet origin
			composer install --working-dir="${path}" --no-dev -n -q

			if [ -e "${path}/.gitmodules" ]; then
				echo "Git submodule update: ${path}"
				git -C "${path}" submodule update --init
			fi
			`,
			[],
			{ shell: true }
		);
	} ) );
}

/**
 * @param {BatchSpawn} batchSpawn
 */
async function setupCore( batchSpawn ) {
	return batchSpawn.spawn(
		`
		git clone ${CORE_GIT} .
		git checkout --quiet origin
		composer install --no-dev -n -q
		`,
		[],
		{ shell: true }
	);
}

/**
 * The number of processing units available.
 *
 * @return {Promise<number>}
 */
async function getProcessingUnitsAvailable() {
	const { stdout } = await exec( 'nproc' );
	return Number( stdout );
}

/**
 * @param {string} repositoryJson JSON string of repositories
 */
async function init( repositoryJson ) {
	const t0 = performance.now();

	const processingUnits = await getProcessingUnitsAvailable();
	const batchSpawn = new BatchSpawn( processingUnits );

	await setupCore( batchSpawn );
	await setupRepos( batchSpawn, repositoryJson );

	const t1 = performance.now();
	const seconds = ( ( t1 - t0 ) / 1000 ).toFixed( 0 );

	console.log( `Finished in ${seconds} seconds` );
}

init( process.argv[ 2 ] );
