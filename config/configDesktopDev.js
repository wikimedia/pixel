const utils = require( '../utils' );
const configDesktop = require( './configDesktop.js' );

/**
 * Modified configuration that outputs to a different directory.
 */
module.exports = Object.assign( {}, configDesktop, {
	scenarios: [],
	paths: utils.makePaths( 'desktop-dev' )
} );
