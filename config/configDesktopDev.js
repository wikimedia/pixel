const utils = require( '../utils' );
const configDesktop = require( './configDesktop.js' );

/**
 * Modified configuration that outputs to a different directory.
 */
module.exports = Object.assign( {}, configDesktop, {
	scenarios: configDesktop.scenarios.map(
		( scenario ) => utils.addFeatureFlagQueryStringsToScenario( scenario, {
			vectorclientpreferences: '1',
			vectorcustomfontsize: '1',
			vectornightmode: '1'
		} )
	),
	paths: utils.makePaths( 'desktop-dev' )
} );
