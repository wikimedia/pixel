// @ts-nocheck
'use strict';

const fs = require( 'fs' );
const path = require( 'path' );
const mustache = require( 'mustache' );  // eslint-disable-line
const { processDiffData, processTotalData } = require( './reporterHelper.js' );

const reportTemplate = fs.readFileSync( path.resolve( __dirname, './Test.mustache' ), 'utf8' );
const resultsTemplate = fs.readFileSync( path.resolve( __dirname, './TestResults.mustache' ), 'utf8' );
const summaryTemplate = fs.readFileSync( path.resolve( __dirname, './Summary.mustache' ), 'utf8' );

module.exports = {
	generateTestHTML: async ( referenceResults, testResults ) => {
		const diffData = processDiffData( referenceResults.issues, testResults.issues );
		const referenceData = processTotalData( referenceResults.issues, 'reference' );
		const testData = processTotalData( testResults.issues, 'test' );

		return mustache.render( reportTemplate, {
			// The current date
			date: new Date(),

			// Test information
			name: testResults.name,
			pageUrl: testResults.pageUrl,

			// Results
			diffData,
			referenceData,
			testData
		}, {
			Results: resultsTemplate
		} );
	},
	generateSummaryHTML: async ( config, summaryData ) => {
		return mustache.render( summaryTemplate, {
			// The current date
			date: new Date(),
			group: `${config.namespace}-a11y`,
			tests: summaryData
		} );
	}
};
