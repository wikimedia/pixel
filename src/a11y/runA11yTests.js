// @ts-nocheck
const fs = require( 'fs' );
const fetch = require( 'node-fetch' ); // eslint-disable-line node/no-missing-require
const path = require( 'path' );
const pa11y = require( 'pa11y' ); // eslint-disable-line node/no-missing-require
const puppeteer = require( 'pa11y/node_modules/puppeteer' ); // eslint-disable-line node/no-missing-require
const loadCookies = require( '../engine-scripts/puppet/loadCookies' );

const { processDiffData } = require( './reporter/reporterHelper.js' );
const { generateTestHTML, generateSummaryHTML } = require( './reporter/reporter.js' );

/**
 *  Delete and recreate the report directory
 *
 * @param {string} type
 * @param {Object} config
 */
function resetDirs( type, config ) {
	// Delete and create json directory
	const jsonDir = config.paths[ `a11y_${type}` ];
	fs.rmSync( jsonDir, { recursive: true, force: true } );
	fs.mkdirSync( jsonDir, { recursive: true } );

	if ( type === 'test' ) {
		// Delete and create report directory
		const reportDir = config.paths.a11y_report;
		fs.rmSync( reportDir, { recursive: true, force: true } );
		fs.mkdirSync( reportDir, { recursive: true } );
	}
}

/**
 *  Get array of promises that run accessibility tests using pa11y
 *
 * @param {string} type
 * @param {Object} config
 * @return {Promise<any>[]}
 */
function getTestPromises( type, config ) {
	return config.tests.map( async ( test ) => {
		const { url, name, ...testOptions } = test;
		let options = { ...testOptions, ...{
			// Automatically enable screen capture for every test;
			screenCapture: `${config.paths[ `a11y_${type}` ]}/${name}.png`
		} };

		// FIXME: update this to not be hardcoded
		if ( name === 'logged_in' ) {
			const browser = await puppeteer.launch( { args: [ '--no-sandbox' ] } );
			const page = await browser.newPage();
			await loadCookies( page, 'Admin' );
			options = { ...options, ...{ browser, page } };
		}

		return pa11y( url, options ).then( ( result ) => {
			result.name = name;
			return result;
		} );
	} );
}

/**
 *  Log test results to Graphite
 *
 * @param {string} namespace
 * @param {string} name
 * @param {number} count
 * @return {Promise<any>}
 */
function sendMetrics( namespace, name, count ) {
	const metricPrefix = 'ci_a11y';
	const beaconUrl = 'https://meta.wikimedia.org/beacon/statsv/?';
	const url = `${beaconUrl}${metricPrefix}.${namespace}.${name}=${count}c`;
	return fetch( url );
}

/**
 *  Process test results, log the results to console, Graphite and an HTML report.
 *
 * @param {Object[]} testResults
 * @param {string} type
 * @param {Object} config
 * @param {boolean} logResults
 * @return {Object} summary data
 */
async function processTestResults( testResults, type, config, logResults ) {
	testResults.issues = testResults.issues.filter( ( issue ) => {
		// Clean up test results
		// Remove htmlcs notices (there are too manu) and issues missing data about the element
		const isHtmlcsNotice = issue.type === 'notice' && issue.runner === 'htmlcs';
		const isMissingContext = !issue.context;
		return !isHtmlcsNotice && !isMissingContext;
	} );

	const errorNum = testResults.issues.filter( ( issue ) => issue.type === 'error' ).length;
	const warningNum = testResults.issues.filter( ( issue ) => issue.type === 'warning' ).length;
	const noticeNum = testResults.issues.filter( ( issue ) => issue.type === 'notice' ).length;
	const name = testResults.name;

	// Log results summary to console
	console.log( `'${name}'- ${errorNum} errors, ${warningNum} warnings, ${noticeNum} notices` );

	// Send data to Graphite
	if ( logResults ) {
		await sendMetrics( config.namespace, testResults.name, errorNum )
			.then( ( response ) => {
				if ( response.ok ) {
					console.log( `'${name}' results logged successfully` );
				} else {
					console.error( `Failed to log '${name}' results` );
				}
			} );
	}

	// Save in json report
	const jsonDir = config.paths[ `a11y_${type}` ];
	fs.writeFileSync( `${jsonDir}/${name}.json`, JSON.stringify( testResults, null, ' ' ), 'utf8' );

	// Save in html report
	if ( type === 'test' ) {
		const referenceResults = require( path.resolve( `${config.paths.a11y_reference}/${name}.json` ) );
		if ( referenceResults ) {
			const html = await generateTestHTML( referenceResults, testResults );
			const diffData = processDiffData( referenceResults.issues, testResults.issues );
			fs.writeFileSync( `${config.paths.a11y_report}/${name}.html`, html, 'utf8' );
			return { name, ...diffData };
		}
	}
	return null;
}

/**
 * Generate html summary of all tests for pixel cloud instance
 *
 * @param {Object} config
 * @param {Object} summaryData
 */
async function createSummaryReport( config, summaryData ) {
	const html = await generateSummaryHTML( config, summaryData );
	fs.writeFileSync( `${config.paths.a11y_report}/index.html`, html, 'utf8' );
}

/**
 *  Run pa11y on tests specified by the config.
 */
async function main() {
	const type = process.argv[ 2 ];
	const configFile = process.argv[ 3 ];
	const logResults = process.argv[ 4 ] === 'true';
	const config = require( `${process.cwd()}/${configFile}` );

	if ( !process.env.PIXEL_MW_SERVER ) {
		throw new Error( 'Missing env variables' );
	}

	if ( !type || !config ) {
		throw new Error( 'Missing arguments' );
	}

	if ( !config.tests || !config.paths.a11y_report ) {
		throw new Error( 'Missing config variables' );
	}

	if ( type === 'test' && !fs.existsSync( config.paths.a11y_reference ) ) {
		throw new Error( 'Run reference before test' );
	}

	const tests = config.tests;
	const allValidTests = tests.filter( ( test ) => test.name ).length === tests.length;
	if ( !allValidTests ) {
		throw new Error( 'Config missing test name' );
	}

	if ( logResults && !config.namespace ) {
		throw new Error( 'Unable to log results, missing config variables' );
	}

	resetDirs( type, config );
	const testPromises = getTestPromises( type, config );
	const testResults = await Promise.all( testPromises );
	const resultPromises = testResults.map( async ( result ) => {
		return await processTestResults( result, type, config, logResults );
	} );
	const summaryData = await Promise.all( resultPromises );
	if ( type === 'test' ) {
		await createSummaryReport( config, summaryData );
	}
	process.exit(); // eslint-disable-line
}

main();
