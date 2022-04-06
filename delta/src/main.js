#!/usr/bin/env node
const checkoutBranch = require( './checkout-branch' );
const checkoutPatch = require( './checkout-patch' );
const repos = require( '../repositories.json' );
const opts = JSON.parse( process.argv[ 2 ] );

async function init() {
	await checkoutBranch( opts.branch, repos );
	await checkoutPatch( opts.changeId ?? [], repos );
}

init();
