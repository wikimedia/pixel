#!/usr/bin/env node
const util = require( 'util' );
const exec = util.promisify( require( 'child_process' ).exec );
const repos = require( '../repositories.json' );
const opts = JSON.parse( process.argv[ 2 ] );
const BatchSpawn = require( './BatchSpawn' );
const benchmark = require( './benchmark' );
const MwCheckout = require( './MwCheckout' );

/**
 * The number of processing units available.
 *
 * @return {Promise<number>}
 */
async function getProcessingUnitsAvailable() {
	const { stdout } = await exec( 'nproc' );
	return Number( stdout );
}

async function init() {
	benchmark( async () => {
		const batchSpawn = new BatchSpawn( await getProcessingUnitsAvailable() );
		const mwCheckout = new MwCheckout( repos, batchSpawn );
		await mwCheckout.checkout( opts.branch, opts.changeId ?? [], opts.ignoreIntentional );
	} );
}

init();
