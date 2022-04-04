#!/usr/bin/env node
const checkoutPatch = require( './checkout-patch' );
const repos = require( '../repositories.json' );
const opts = JSON.parse( process.argv[ 2 ] );

checkoutPatch( opts.changeId ?? [], repos );
