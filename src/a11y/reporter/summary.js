// @ts-nocheck
'use strict';

const fs = require( 'fs' );
const path = require( 'path' );
const mustache = require( 'mustache' );  // eslint-disable-line

const summaryTemplate = fs.readFileSync( path.resolve( __dirname, './summary.mustache' ), 'utf8' );

async function generateHTML( config ) {
	const names = config.tests.map( ( test ) => {
		return test.name;
	} );
	return mustache.render( summaryTemplate, {
		// The current date
		date: new Date(),
		group: `${config.namespace}-a11y`,
		names
	} );
}

module.exports = {
	results: generateHTML
};
