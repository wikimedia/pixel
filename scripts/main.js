#!/usr/bin/env node
const checkoutPatch = require( './checkout-patch' );
const repos = require( '../repositories.json' );
const { program } = require( 'commander' );
const branchOpt = /** @type {const} */ ( [ '-b, --branch <name-of-branch>', 'Name of branch. Can be `master` or a release branch (e.g. `origin/wmf/1.37.0-wmf.19`)', 'master' ] );
const changeIdOpt = /** @type {const} */ ( [ '-c, --change-id <Change-Id...>', 'The Change-Id to use' ] );

program
	.command( 'reference' )
	.description( 'Take reference snapshots' )
	.requiredOption( ...branchOpt )
	.option( ...changeIdOpt )
	.action( ( opts ) => {
		console.log( 'in reference', opts );
		checkoutPatch( opts.changeId, repos );
	} );

program
	.command( 'test' )
	.description( 'Take test snapshots' )
	.requiredOption( ...branchOpt )
	.option( ...changeIdOpt )
	.action( ( opts ) => {
		console.log( 'in test', opts );
		checkoutPatch( opts.changeId, repos );
	} );

program.parse();

// // Chain
// const changeQueue = ['I85324d04ecde38aad5f827c7aa33d989089e6d33'];
// // const changeQueue = [ 'Iff231a976c473217b0fa4da1aa9a8d1c2a1a19f2' ]

// init( changeQueue );
