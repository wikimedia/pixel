// @ts-nocheck
'use strict';

const mustache = require( 'mustache' );

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
// where the key is the type, and the value is an array of messages
function getMessagesByType( issues ) {
	return issues.reduce( ( result, issue ) => {
		if ( !result[ issue.type ] ) {
			result[ issue.type ] = [ issue.message ];
		} else if ( !result[ issue.type ].includes( issue.message ) ) {
			result[ issue.type ].push( issue.message );
		}
		return result;
	}, {} );
}

// Converts array of issues into a map
// where the key is the message, and the value is an array of issues
function getIssuesByMessage( issues ) {
	return issues.reduce( ( result, issue ) => {
		if ( !result[ issue.message ] ) {
			result[ issue.message ] = [ issue ];
		} else {
			result[ issue.message ].push( issue );
		}
		return result;
	}, {} );
}

function getTypes( messagesByType ) {
	const values = {
		error: -1,
		warning: 0,
		notice: 1
	};
	return Object.keys( messagesByType ).sort( ( a, b ) => {
		return values[ a ] - values[ b ];
	} );
}

function getMessageTemplateData( type, messagesByType, issuesByMessage ) {
	return messagesByType[ type ].map( ( message ) => {
		const firstIssue = issuesByMessage[ message ][ 0 ];
		const hasRunnerExtras = Object.keys( firstIssue.runnerExtras ).length > 0;
		return {
			message,
			issueCount: issuesByMessage[ message ].length,
			runner: firstIssue.runner,
			runnerExtras: hasRunnerExtras ? firstIssue.runnerExtras : false,
			code: firstIssue.code,
			issues: issuesByMessage[ message ]
		};
	} ).sort( ( a, b ) => {
		// Sort messages by number of issues
		return b.issueCount - a.issueCount;
	} );
}

function processDiffData( issues, issuesByDiff ) {
	const messagesByType = getMessagesByType( issues );
	const issuesByMessage = getIssuesByMessage( issues );

	const types = getTypes( messagesByType );
	const issueData = types.map( ( type ) => ( {
		type,
		typeLabel: upperCaseFirst( type ) + 's',
		removedCount: issuesByDiff[ '-' ].filter( ( issue ) => issue.type === type ).length,
		addedCount: issuesByDiff[ '+' ].filter( ( issue ) => issue.type === type ).length,
		messages: getMessageTemplateData( type, messagesByType, issuesByMessage )
	} ) );
	return issueData;
}

function processTotalData( issues ) {
	const messagesByType = getMessagesByType( issues );
	const issuesByMessage = getIssuesByMessage( issues );

	const types = getTypes( messagesByType );
	const issueData = types.map( ( type ) => ( {
		type,
		typeLabel: upperCaseFirst( type ) + 's',
		typeCount: messagesByType[ type ].length,
		messages: getMessageTemplateData( type, messagesByType, issuesByMessage )
	} ) );
	return issueData;
}

// Compile template and output formatted results
report.results = async ( referenceResults, testResults, reportTemplate ) => {
	const issuesByDiff = { '-': [], '+': [] };
	const referenceMap = getIssuesMap( referenceResults.issues );
	const testMap = getIssuesMap( testResults.issues );
	const removedIssues = referenceResults.issues
		.filter( ( issue ) => !testMap[ getIssueKey( issue ) ] )
		.map( ( issue ) => {
			issue.isDeletion = true;
			issuesByDiff[ '-' ].push( issue );
			return issue;
		} );
	const addedIssues = testResults.issues
		.filter( ( issue ) => !referenceMap[ getIssueKey( issue ) ] )
		.map( ( issue ) => {
			issue.isDeletion = false;
			issuesByDiff[ '+' ].push( issue );
			return issue;
		} );

	const diffData = processDiffData( addedIssues.concat( removedIssues ), issuesByDiff );
	const totalData = processTotalData( testResults.issues );

	const errorCount = testResults.issues.filter( ( issue ) => issue.type === 'error' ).length;
	const warningCount = testResults.issues.filter( ( issue ) => issue.type === 'warning' ).length;
	const noticeCount = testResults.issues.filter( ( issue ) => issue.type === 'notice' ).length;

	return mustache.render( reportTemplate, {
		// The current date
		date: new Date(),

		// Test information
		name: testResults.name,
		pageUrl: testResults.pageUrl,

		// Results
		diffData,
		totalData,

		// Issue counts
		errorCount: errorCount > 0 && errorCount,
		warningCount: warningCount > 0 && warningCount,
		noticeCount: noticeCount > 0 && noticeCount,
		removedCount: removedIssues.length > 0 && removedIssues.length,
		addedCount: addedIssues.length > 0 && addedIssues.length
	} );
};

// Output error messages
report.error = ( message ) => {
	return message;
};
