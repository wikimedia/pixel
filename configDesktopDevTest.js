const utils = require( './utils' );
const configDesktop = require( './configDesktop.js' );

/**
 * Modified configuration that outputs to a different directory with certain feature flags enabled
 */
module.exports = Object.assign( {}, configDesktop, {
	scenarios: configDesktop.scenarios.map(
		( scenario ) => utils.addFeatureFlagQueryStringsToScenario( scenario, {
			vectorgrid: '1',
			vectortitleabovetabs: '1'
		} )
	),
	paths: utils.makePaths( 'desktop-development' )
} );
