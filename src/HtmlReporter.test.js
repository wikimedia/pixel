const HtmlReporter = require( './HtmlReporter' );
const fs = require( 'fs' );

jest.mock( 'fs' );

/**
 * @param {Object} [mergedOpts]
 * @return {HtmlReporter}
 */
function createHtmlReporter( mergedOpts = {} ) {
	return new HtmlReporter( {
		type: 'test',
		branch: 'master',
		group: 'desktop',
		changeId: [ 'c123456' ],
		reportPath: '/pixel/report',
		testScreenshotsPath: '/pixel/report/test-screenshots-desktop',
		...mergedOpts
	} );
}

describe( 'HtmlReporter.js', () => {
	afterEach( () => {
		jest.resetModules();
	} );

	describe( 'onStart', () => {
		// Backstop already removes reference screenshots.
		it( 'does not try to remove screenshots when `type` === `reference`', () => {
			const htmlReporter = createHtmlReporter( {
				type: 'reference'
			} );

			htmlReporter.onStart();

			expect( fs.rmSync ).not.toHaveBeenCalled();
		} );

		it( 'removes previous test screnshots when type is `test` and saves context', () => {
			const htmlReporter = createHtmlReporter();

			htmlReporter.onStart();

			expect( fs.rmSync ).toHaveBeenCalledWith(
				'/pixel/report/test-screenshots-desktop',
				{ force: true, recursive: true }
			);
		} );
	} );

	describe( 'onEnd', () => {
		it( 'does not write group html file if `type` === `reference', () => {
			const htmlReporter = createHtmlReporter( {
				type: 'reference'
			} );

			htmlReporter.onEnd( 'pass' );

			expect( fs.writeFileSync ).not.toHaveBeenCalledWith(
				'/pixel/report/desktop/index.html',
				expect.anything()
			);
		} );

		it( 'saves a context.json file when `type` === `reference`', () => {
			const htmlReporter = createHtmlReporter( {
				type: 'reference',
				changeId: []
			} );

			/** @type {jest.Mock} */ ( fs.existsSync )
				.mockImplementation( () => {
					return false;
				} );

			htmlReporter.onEnd( 'fail' );

			expect( fs.writeFileSync ).toHaveBeenCalledWith(
				'/pixel/report/desktop/context.json',
				JSON.stringify( {
					test: 'unknown',
					reference: 'master',
					group: 'desktop',
					result: 'fail'
				} )
			);
		} );

		it( 'saves an index.html file with context when `type` === `test`', () => {
			const htmlReporter = createHtmlReporter();
			const context = {
				test: 'master with c12345',
				reference: 'origin/wmf/1.39.0-wmf.15',
				group: 'desktop'
			};

			/** @type {jest.Mock} */ ( fs.existsSync )
				.mockImplementation( () => {
					return true;
				} );

			/** @type {jest.Mock} */ ( fs.readFileSync )
				.mockImplementation( ( path ) => {
					switch ( path ) {
						case '/pixel/report/desktop/context.json':
							return JSON.stringify( context );
						case '/pixel/report/desktop/index.html':
							return '<div id="root">';
					}
				} );

			/** @type {jest.Mock} */ ( fs.readdirSync )
				.mockImplementationOnce( () => {
					return [
						{
							isDirectory: () => true,
							name: 'desktop-test-screenshots'
						},
						{
							isDirectory: () => true,
							name: 'desktop'
						}
					];
				} );

			htmlReporter.onEnd( 'pass' );

			expect( fs.writeFileSync ).toHaveBeenCalledWith(
				'/pixel/report/desktop/index.html',
				expect.stringContaining( 'Test group: <strong>desktop</strong>' )
			);

			expect( fs.writeFileSync ).toHaveBeenCalledWith(
				'/pixel/report/desktop/index.html',
				expect.stringContaining( 'Comparing origin/wmf/1.39.0-wmf.15 against master with c12345' )
			);

			expect( fs.writeFileSync ).toHaveBeenCalledWith(
				'/pixel/report/index.html',
				expect.stringContaining( 'origin/wmf/1.39.0-wmf.15 against master with c12345' )
			);

			expect( fs.writeFileSync ).toHaveBeenCalledWith(
				'/pixel/report/index.html',
				expect.stringContaining( 'status-indicator--pass' )
			);
		} );
	} );
} );
