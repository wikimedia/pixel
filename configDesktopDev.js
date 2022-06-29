const configDesktop = require( './configDesktop.js' );

/**
 * Modified configuration that outputs to a different directory.
 */
module.exports = Object.assign( {}, configDesktop, {
	paths: {
		// eslint-disable-next-line camelcase
		bitmaps_reference: 'report/reference-screenshots-desktop-development',
		// eslint-disable-next-line camelcase
		bitmaps_test: 'report/test-screenshots-desktop-development',
		// eslint-disable-next-line camelcase
		engine_scripts: 'src/engine-scripts',
		// eslint-disable-next-line camelcase
		html_report: 'report/desktop-dev',
		// eslint-disable-next-line camelcase
		ci_report: 'report/ci-report-dev',
		// eslint-disable-next-line camelcase
		json_report: 'report/json-report-dev'
	},
} );

