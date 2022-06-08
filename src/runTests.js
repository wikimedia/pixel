#!/usr/bin/env node

const HtmlReporter = require( './HtmlReporter' );
const Runner = require( './Runner' );

const ROOT_PATH = '/pixel';
const REPORT_PATH = `${ROOT_PATH}/report`;
const argv = process.argv[ 2 ];

if ( !argv ) {
	console.info( 'Must pass a JSON string as argument: `runTests.js {"key": "value"}`' );
	// eslint-disable-next-line no-process-exit
	process.exit( 0 );
}

/**
 * @typedef {Object} Opts
 * @property {'reference'|'test'} type
 * @property {string} branch
 * @property {string} group
 * @property {string[]} changeId
 */

const opts = /** @type {Opts} */ ( JSON.parse( argv ) );

/**
 * @param {string} str
 * @return {string} Return string in title case form e.g. ("mobile" becomes "Mobile").
 */
function toTitleCase( str ) {
	return str.charAt( 0 ).toUpperCase() + str.slice( 1 );
}

async function init() {
	try {
		const config = require( `${ROOT_PATH}/config${toTitleCase( opts.group )}` );
		const htmlReporter = new HtmlReporter( {
			reportPath: REPORT_PATH,
			testScreenshotsPath: `${ROOT_PATH}/${config.paths.bitmaps_test}`,
			...opts
		} );

		const runner = new Runner( {
			config,
			type: opts.type,
			reporter: htmlReporter
		} );
		await runner.run();
	} catch ( /** @type {unknown} */ e ) {
		if ( e instanceof Error && e.message.includes( 'Mismatch errors found' ) ) {
			// eslint-disable-next-line no-process-exit
			process.exit( 10 );
		}

		console.error( e );
		// eslint-disable-next-line no-process-exit
		process.exit( 1 );
	}
}

init();
