// @ts-nocheck
'use strict';

const fs = require( 'fs' );
const path = require( 'path' );
const mustache = require( 'mustache' );  // eslint-disable-line

const reportTemplate = fs.readFileSync( path.resolve( __dirname, './Report.mustache' ), 'utf8' );
const resultsTemplate = fs.readFileSync( path.resolve( __dirname, './Results.mustache' ), 'utf8' );
const report = module.exports = {};

// Pa11y version support
report.supports = '^6.0.0 || ^6.0.0-alpha || ^6.0.0-beta';

// Utility function to uppercase the first character of a string
function upperCaseFirst( string ) {
	return string.charAt( 0 ).toUpperCase() + string.slice( 1 );
}

// Constructs unique key for issue
function getIssueKey( issue ) {
	return `${issue.code}${issue.selector}`;
}

// Converts array of issues into a map
function getIssuesMap( issues ) {
	return issues.reduce( ( result, issue ) => {
		result[ getIssueKey( issue ) ] = issue;
		return result;
	}, {} );
}

// Converts array of issues into a map
// where the key is the type, and the value is an array of codes
function getCodesByType( issues ) {
	return issues.reduce( ( result, issue ) => {
		if ( !result[ issue.type ] ) {
			result[ issue.type ] = [ issue.code ];
		} else if ( !result[ issue.type ].includes( issue.code ) ) {
			result[ issue.type ].push( issue.code );
		}
		return result;
	}, {} );
}

// Converts array of issues into a map
// where the key is the code, and the value is an array of issues
function getIssuesByCode( issues ) {
	return issues.reduce( ( result, issue ) => {
		if ( !result[ issue.code ] ) {
			result[ issue.code ] = [ issue ];
		} else {
			result[ issue.code ].push( issue );
		}
		return result;
	}, {} );
}

function getTypes( codesByType ) {
	const values = {
		error: -1,
		warning: 0,
		notice: 1
	};
	return Object.keys( codesByType ).sort( ( a, b ) => {
		return values[ a ] - values[ b ];
	} );
}

function getCodeTemplateData( type, codesByType, issuesByCode ) {
	return codesByType[ type ].map( ( code ) => {
		const firstIssue = issuesByCode[ code ][ 0 ];
		const hasRunnerExtras = Object.keys( firstIssue.runnerExtras ).length > 0;
		return {
			message: firstIssue.message,
			issueCount: issuesByCode[ code ].length,
			runner: firstIssue.runner,
			runnerExtras: hasRunnerExtras ? firstIssue.runnerExtras : false,
			code,
			issues: issuesByCode[ code ]
		};
	} ).sort( ( a, b ) => {
		// Sort codes by number of issues
		return b.issueCount - a.issueCount;
	} );
}

function processDiffData( referenceIssues, testIssues ) {
	const referenceMap = getIssuesMap( referenceIssues );
	const testMap = getIssuesMap( testIssues );
	const issuesByDiff = { '-': [], '+': [] };
	const removedIssues = referenceIssues
		.filter( ( issue ) => !testMap[ getIssueKey( issue ) ] )
		.map( ( issue ) => {
			issue.isDeletion = true;
			issuesByDiff[ '-' ].push( issue );
			return issue;
		} );
	const addedIssues = testIssues
		.filter( ( issue ) => !referenceMap[ getIssueKey( issue ) ] )
		.map( ( issue ) => {
			issue.isDeletion = false;
			issuesByDiff[ '+' ].push( issue );
			return issue;
		} );
	const issues = addedIssues.concat( removedIssues );
	const codesByType = getCodesByType( issues );
	const issuesByCode = getIssuesByCode( issues );

	const types = getTypes( codesByType );
	const issueData = types.map( ( type ) => ( {
		type,
		typeLabel: upperCaseFirst( type ) + 's',
		removedCount: issuesByDiff[ '-' ].filter( ( issue ) => issue.type === type ).length,
		addedCount: issuesByDiff[ '+' ].filter( ( issue ) => issue.type === type ).length,
		codes: getCodeTemplateData( type, codesByType, issuesByCode )
	} ) );
	return {
		data: issueData,
		totalRemovedCount: removedIssues.length > 0 && removedIssues.length,
		totalAddedCount: addedIssues.length > 0 && addedIssues.length
	};
}

function processTotalData( issues, name ) {
	const codesByType = getCodesByType( issues );
	const issuesByCode = getIssuesByCode( issues );

	const types = getTypes( codesByType );
	const issueData = types.map( ( type ) => ( {
		type,
		typeLabel: upperCaseFirst( type ) + 's',
		typeCount: codesByType[ type ].length,
		codes: getCodeTemplateData( type, codesByType, issuesByCode )
	} ) );
	return {
		name,
		data: issueData,
		totalErrorCount: issues.filter( ( issue ) => issue.type === 'error' ).length,
		totalWarningCount: issues.filter( ( issue ) => issue.type === 'warning' ).length,
		totalNoticeCount: issues.filter( ( issue ) => issue.type === 'notice' ).length
	};
}

// Compile template and output formatted results
report.results = async ( referenceResults, testResults ) => {
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
};

// Output error messages
report.error = ( message ) => {
	return message;
};
