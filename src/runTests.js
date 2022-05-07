#!/usr/bin/env node
// eslint-disable-next-line node/no-missing-require
const backstop = require( 'backstopjs' );
const opts = /** @type {Opts} */ ( JSON.parse( process.argv[ 2 ] ) );
const fs = require( 'fs' );
const util = require( 'util' );
const readdir = util.promisify( fs.readdir );
const DATA_PATH = '/vrdata';
const REPORT_DIR_PATH = `${DATA_PATH}/pixel-report`;
const GROUP_PATH = `${REPORT_DIR_PATH}/${opts.group}`;
const GROUP_INDEX_PATH = `${GROUP_PATH}/index.html`;
const INDEX_PATH = `${DATA_PATH}/pixel-report/index.html`;
const CONTEXT_PATH = `${DATA_PATH}/context.json`;
const UNKNOWN_CONTEXT = {
	test: 'unknown',
	reference: 'unknown',
	group: 'unknown'
};

/**
 * @param {string} str
 * @return {string} Return string in title case form e.g. ("mobile" becomes "Mobile").
 */
function toTitleCase( str ) {
	return str.charAt( 0 ).toUpperCase() + str.slice( 1 );
}

const config = require( `/pixel/config${toTitleCase( opts.group )}` );

/**
 * @typedef {Object} Opts
 * @property {'reference'|'test'} type
 * @property {string} configPath
 * @property {string} branch
 * @property {string} group
 */

/**
 * @typedef {Object} Context
 * @property {string} reference
 * @property {string} test
 * @property {string} group
 */

/**
 * @typedef {Object} Report
 * @property {string} reference
 * @property {string} test
 * @property {string} group
 * @property {string} name
 */

/**
 * @param {Report[]} reports
 * @return {string}
 */
function renderIndexTemplate( reports ) {
	return `
<!DOCTYPE html>
<html>
	<head>
		<title>UI regression reports</title>
		<style>
			body {
				margin: 0;
				padding: 0;
				font-family: sans-serif;
			}

			ul {
				list-style: none;
				margin: 0;
				padding: 0;
			}

			a {
				text-decoration: none;
			}

			.container {
				max-width: 1200px;
				margin-left: auto;
				margin-right: auto;
				padding-left: 24px;
				padding-right: 24px;
			}

			.card {
				display: flex;
				gap: 16px;
				align-items: center;
				justify-content: space-between;
				background: rgb(248, 249, 251);
				color: rgb(17, 24, 39);
				margin-bottom: 8px;
				padding: 24px 16px;
				border-radius: 8px;
				font-size: 22px;
			}

			.tag {
				font-size: 14px;
				background: rgb(229 231 235);
				color: #4d535e;
				border-radius: 50px;
				padding: 4px 8px;
				white-space: nowrap;
				text-overflow: ellipsis;
				overflow: hidden;
			}
		</style>
	</head>
	<body>
		<div class="container">
			<h1>UI regression reports</h1>
			<ul>
				${reports.map( ( report ) => `
				<li>
					<a href="${report.name}/index.html">
						<div class="card">
							<div>${report.name}</div>
							<code class="tag">${report.reference} against ${report.test}</code>
						</div>
					</a>
				</li>
				` ).join( '\n' )} 
			</ul>
		</div>
	</body>
</html>`;
}

/**
 * Writes context (date and branches used) to report.
 *
 * @param {Context} context
 */
async function prepareReportIfNecessary( context ) {
	if ( opts.type !== 'test' ) {
		return;
	}

	// Add message at top of group report that shows context of of the run.
	const markerString = '<div id="root">';
	const fileString = fs.readFileSync( GROUP_INDEX_PATH ).toString().replace(
		markerString,
		`<div style="color: #000; box-sizing: border-box;
margin-bottom: 16px;border: 1px solid; padding: 12px 24px;
word-wrap: break-word; overflow-wrap: break-word; overflow: hidden;
background-color: #eaecf0; border-color: #a2a9b1;">
<h2>Test group: <strong>${context.group}</strong></h2>
<p>Comparing ${context.reference} against ${context.test}.</p>
<p>Test ran on ${new Date()}</p>
</div>
${markerString}`
	);
	fs.writeFileSync( `${GROUP_PATH}/context.json`, JSON.stringify( context ) );
	fs.writeFileSync( GROUP_INDEX_PATH, fileString );

	// Add root index.html that shows list of reports.
	const reports = ( await readdir( REPORT_DIR_PATH, { withFileTypes: true } ) )
		.filter( ( file ) => file.isDirectory() && !file.name.includes( 'screenshots' ) )
		.map( ( dir ) => {
			const groupPath = `${REPORT_DIR_PATH}/${dir.name}/context.json`;
			const reportContext = JSON.parse( fs.readFileSync( groupPath ).toString() );

			return {
				name: dir.name,
				...reportContext
			};
		} );

	fs.writeFileSync( INDEX_PATH, renderIndexTemplate( reports ) );
}

async function init() {
	const /** @type {Context} */ context =
		fs.existsSync( CONTEXT_PATH ) ?
			JSON.parse( fs.readFileSync( CONTEXT_PATH ).toString() ) :
			{
				...UNKNOWN_CONTEXT
			};

	if ( opts.type === 'test' ) {
		// Remove prior test screenshot directories to prevent them building up.
		// Backstop already deletes reference screenshots.
		fs.rmdirSync( config.paths.bitmaps_test, { recursive: true } );
	}

	// Save context for future use.
	context[ opts.type ] = opts.branch;
	context.group = opts.group;
	fs.writeFileSync( CONTEXT_PATH, JSON.stringify( context ) );

	// @ts-ignore
	await backstop( opts.type, { config } )
		.then( () => {
			return prepareReportIfNecessary( context );
		} )
		.catch( async ( /** @type {unknown} */ e ) => {
			if ( e instanceof Error && e.message.includes( 'Mismatch errors found' ) ) {
				await prepareReportIfNecessary( context );

				// eslint-disable-next-line no-process-exit
				process.exit( 1 );
			}

			throw e;
		} );
}

init();
