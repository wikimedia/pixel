#!/usr/bin/env node
const repos = require( '../repositories.json' );
const opts = JSON.parse( process.argv[ 2 ] );
const BatchSpawn = require( './BatchSpawn' );
const benchmark = require( './benchmark' );
const MwCheckout = require( './MwCheckout' );

/** @type {Object.<string, string>} */
const repoBranches = {};
for ( const rb of ( opts.repoBranch ?? [] ) ) {
	const [ repo, branch ] = rb.split( ':' );
	repoBranches[ repo ] = branch;
}

async function init() {
	benchmark( async () => {
		const batchSpawn = new BatchSpawn();
		const mwCheckout = new MwCheckout( repos, batchSpawn );
		await mwCheckout.checkout( opts.branch, opts.changeId ?? [], repoBranches );
	} );
}

init();
