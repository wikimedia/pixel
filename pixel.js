#!/usr/bin/env node

const execSync = require( 'child_process' ).execSync;
execSync( 'docker-compose start' );

const spawn = require( 'child_process' ).spawn;
const mainCommand = spawn( 'docker-compose', [ 'exec', 'mediawiki', '/scripts/main.js', ...process.argv.slice( 2 ) ] );

mainCommand.stdout.on( 'data', ( data ) => {
	const strData = data.toString();
	console.log( strData );
} );

mainCommand.stderr.on( 'data', ( data ) => {
	console.log( data );
} );

mainCommand.on( 'close', ( code ) => {
	console.log( 'Child exited with', code, 'and stdout has been saved' );
	if ( code === 0 ) {
		spawn( 'docker-compose', [ 'run', 'visual-regression', 'test', '--config', 'backstop.config.js' ], { stdio: 'inherit' } );
	}
	// at this point 'savedOutput' contains all your data.
} );

//  "test": "docker-compose run visual-regression test --config
//  backstop.config.js && app/backstop_data/html_report/index.html; open
//  app/backstop_data/html_report/index.html",
