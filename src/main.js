#!/usr/bin/env node
const checkoutBranch = require( './checkoutBranch' );
const checkoutPatch = require( './checkoutPatch' );
const repos = require( '../repositories.json' );
const opts = JSON.parse( process.argv[ 2 ] );

async function init() {
	await checkoutBranch( opts.branch, repos );
	await checkoutPatch( opts.changeId ?? [], repos );
}

init();
