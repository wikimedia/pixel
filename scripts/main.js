#!/usr/bin/env node
const checkoutPatch = require( './checkout-patch' );
const repos = require( '../repositories.json' );
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
	.name( 'pixel.js' )
	.description( 'Welcome to the pixel CLI to perform visual regression testing' );

program
	.command( 'reference' )
	.description( 'Create reference (baseline) screenshots that your test snapshots will be compared against.' )
	.requiredOption( ...branchOpt )
	.option( ...changeIdOpt )
	.action( ( opts ) => {
		console.log( 'in reference', opts );
		checkoutPatch( opts.changeId ?? [], repos );
	} );

program
	.command( 'test' )
	.description( 'Create test screenshots and compare them against the reference screenshots.' )
	.requiredOption( ...branchOpt )
	.option( ...changeIdOpt )
	.action( ( opts ) => {
		console.log( 'in test', opts );
		checkoutPatch( opts.changeId ?? [], repos );
	} );

program.parse();
