const fs = require( 'fs' );
const UNKNOWN_CONTEXT = {
	test: 'unknown',
	reference: 'unknown',
	group: 'unknown',
	result: 'unknown'
};

/**
 * @typedef {Object} Context
 * @property {string} reference
 * @property {string} test
 * @property {string} group
 * @property {string} result
 */

/**
 * @typedef {Object} Opts
 * @property {'reference'|'test'} type
 * @property {string} branch
 * @property {string} group
 * @property {string[]} changeId
 * @property {string} reportPath
 * @property {string} testScreenshotsPath
 */

/**
 * Responsible for making static html visual regression reports.
 */
class HtmlReporter {
	/** @type {Opts} */ #opts;
	/** @type {string} */ #contextPath;
	/** @type {string} */ #groupPath;
	/** @type {string} */ #groupIndexPath;
	/** @type {string} */ #indexPath;

	/**
	 * @param {Opts} opts
	 */
	constructor( opts ) {
		this.#opts = opts;
		this.#indexPath = `${this.#opts.reportPath}/index.html`;
		this.#groupPath = `${this.#opts.reportPath}/${opts.group}`;
		this.#groupIndexPath = `${this.#groupPath}/index.html`;
		this.#contextPath = `${this.#groupPath}/context.json`;
	}

	/**
	 * Called when the test suite starts.
	 */
	onStart() {
		if ( this.#opts.type === 'test' ) {
			// Remove prior test screenshot directories to prevent them building up.
			// Backstop already deletes reference screenshots.
			fs.rmSync( this.#opts.testScreenshotsPath, { force: true, recursive: true } );
			return;
		}
	}

	/**
	 * Called when the test suite ends.
	 *
	 * @param {"pass"|"fail"} result
	 */
	onEnd( result ) {
		const context = this.#saveContext( result );

		if ( this.#opts.type !== 'test' ) {
			return;
		}

		// Add message at top of group report that shows context of the run.
		const markerString = '<div id="root">';
		const groupIndex = fs.readFileSync( this.#groupIndexPath ).toString().replace(
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

		// Add context header at top of group report.
		fs.writeFileSync( this.#groupIndexPath, groupIndex );

		this.#saveRootIndex();
	}

	/**
	 * @return {Context}
	 */
	#getContext() {
		return this.#opts.type === 'test' && fs.existsSync( this.#contextPath ) ?
			JSON.parse( fs.readFileSync( this.#contextPath ).toString() ) :
			{
				...UNKNOWN_CONTEXT
			};
	}

	/**
	 * @param {"pass"|"fail"} result
	 * @return {Context}
	 */
	#saveContext( result ) {
		const context = {
			...this.#getContext(),
			result
		};

		// Save context for future use.
		context[ this.#opts.type ] = this.#opts.changeId && this.#opts.changeId.length ?
			`${this.#opts.branch} with ${this.#opts.changeId.map( ( changeId ) => changeId.slice( 0, 6 ) ).join( ', ' )}` : this.#opts.branch;
		context.group = this.#opts.group;

		// Create group report directory if it doesn't exist already.
		fs.mkdirSync( this.#groupPath, { recursive: true } );
		// Write context in the group report directory.
		fs.writeFileSync( this.#contextPath, JSON.stringify( context ) );

		return context;
	}

	#saveRootIndex() {
		// Add root index.html that shows list of reports.
		const contexts = /** @type {Context[]} */ (
			( fs.readdirSync( this.#opts.reportPath, { withFileTypes: true } ) )
				.filter( ( file ) => file.isDirectory() && !file.name.includes( 'screenshots' ) && fs.existsSync( `${this.#opts.reportPath}/${file.name}/context.json` ) )
				.map( ( dir ) => {
					const groupContextPath = `${this.#opts.reportPath}/${dir.name}/context.json`;

					return JSON.parse( fs.readFileSync( groupContextPath ).toString() );
				} )
		);

		fs.writeFileSync( this.#indexPath, this.#renderIndexTemplate( contexts ) );
	}

	/**
	 * Renders list of reports as an html string.
	 *
	 * @param {Context[]} contexts
	 * @return {string}
	 */
	#renderIndexTemplate( contexts ) {
		return `
<!DOCTYPE html>
<html lang="en">
	<head>
    <meta charset="UTF-8">
		<meta name="viewport" content="width=device-width, initial-scale=1">
		<title>Pixel | Visual Regression Reports</title>
		<style>
			body {
				margin: 0;
				padding: 0;
				font-family: sans-serif;
				color: #202122;
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
				align-items: center;
				justify-content: space-between;
				gap: 16px;
				background: #f8f9fa;
				color: #202122;
				margin-bottom: 8px;
				padding: 24px 16px;
				border-radius: 8px;
				font-size: 22px;
			}

			.card__end {
				display: flex;
				min-width: 0;
				align-items: center;
				gap: 8px;
			}

			.status-indicator {
				border-radius: 50%;
				width: 10px;
				height: 10px;
			}

			.status-indicator--pass {
				background: #00af89;
			}

			.status-indicator--fail {
				background: #d33;
			}

			.status-indicator--unknown {
				background: #54595d;
			}

			.tag {
				font-size: 14px;
				background: #c8ccd1;
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
				${contexts.map( ( context ) => `
				<li>
					<a href="${context.group}/index.html">
						<div class="card">
							<div class="card__start">
								<div>${context.group}</div>
							</div>
							<div class="card__end">
								<code class="tag">${context.reference} against ${context.test}</code>
								<div class="status-indicator status-indicator--${context.result}"></div>
							</div>
						</div>
					</a>
				</li>
				` ).join( '\n' )} 
			</ul>
		</div>
	</body>
</html>`;
	}

}

module.exports = HtmlReporter;
