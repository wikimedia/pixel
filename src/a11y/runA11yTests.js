// @ts-nocheck
const fs = require( 'fs' );
const fetch = require( 'node-fetch' );
const path = require( 'path' );
const pa11y = require( 'pa11y' );
const puppeteer = require( 'puppeteer' );
const loadCookies = require( '../engine-scripts/puppet/loadCookies' );

const htmlReporter = require( path.resolve( __dirname, './reporter/reporter.js' ) );
const reportTemplate = fs.readFileSync( path.resolve( __dirname, './reporter/report.mustache' ), 'utf8' );

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
		fs.rmSync( config.paths.a11y_report, { recursive: true, force: true } );
		fs.mkdirSync( config.paths.a11y_report, { recursive: true } );
	}
}

/**
 *  Get array of promises that run accessibility tests using pa11y
 *
 * @param {Object[]} tests
 * @param {Object} config
 * @return {Promise<any>[]}
 */
function getTestPromises( tests, config ) {
	return tests.map( async ( test ) => {
		const { url, name, ...testOptions } = test;
		let options = { ...testOptions, ...{
			// Automatically enable screen capture for every test;
			screenCapture: `${config.paths.a11y_report}/${name}.png`
		} };

		// FIXME: update this to not be hardcoded
		if ( name === 'logged_in' ) {
			const browser = await puppeteer.launch();
			const page = await browser.newPage();
			await loadCookies( page, 'Admin' );
			options = { ...options, ...{ browser, page } };
		}

		return pa11y( url, options ).then( ( testResult ) => {
			testResult.name = name;
			return testResult;
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
	const url = `${process.env.WMF_JENKINS_BEACON_URL}${metricPrefix}.${namespace}.${name}=${count}c`;
	return fetch( url );
}

/**
 *  Process test results, log the results to console, Graphite and an HTML report.
 *
 * @param {Object[]} testResults
 * @param {string} type
 * @param {Object} config
 * @param {Object} opts
 */
async function processTestResults( testResults, type, config, opts ) {
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
	// WMF_JENKINS_BEACON_URL is only defined in CI env
	if ( opts.logResults ) {
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
	fs.promises.writeFile( `${jsonDir}/${name}.json`, JSON.stringify( testResults, null, ' ' ), 'utf8' );

	// Save in html report
	if ( type === 'test' ) {
		const referenceResults = require( path.resolve( `${config.paths.a11y_reference}/${name}.json` ) );
		if ( referenceResults ) {
			const html = await htmlReporter.results(
				referenceResults,
				testResults,
				reportTemplate
			);
			fs.promises.writeFile( `${config.paths.a11y_report}/${name}.html`, html, 'utf8' );
		}
	}
}

/**
 *  Run pa11y on tests specified by the config.
 *
 * @param {string} type
 * @param {Object} config
 */
async function main( type, config ) {
	if ( !process.env.PIXEL_MW_SERVER ) {
		throw new Error( 'Missing env variables' );
	}
	if ( !config.tests || !config.paths.a11y_report ) {
		throw new Error( 'Missing config variables' );
	}

	// FIXME: update this to not be hardcoded
	const opts = {
		logResults: false
	};

	const tests = config.tests;
	const allValidTests = tests.filter( ( test ) => test.name ).length === tests.length;
	if ( !allValidTests ) {
		throw new Error( 'Config missing test name' );
	}

	const canLogResults = process.env.WMF_JENKINS_BEACON_URL && config.namespace;
	if ( opts.logResults && !canLogResults ) {
		throw new Error( 'Unable to log results, missing config or env variables' );
	}

	resetDirs( type, config );

	const testPromises = getTestPromises( tests, config );
	const testResults = await Promise.all( testPromises );
	const resultPromises = testResults.map( async ( result ) => {
		await processTestResults( result, type, config, opts );
	} );
	await Promise.all( resultPromises );
}

module.exports = main;
