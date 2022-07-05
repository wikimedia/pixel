const configDesktop = require( './configDesktop.js' );
const CURRENT_DEV_FEATURES = {
	vectorgrid: '1',
	vectortitleabovetabs: '1'
};

/**
 * @return {string}
 */
const getFeatureQueryString = () => {
	return Object.keys( CURRENT_DEV_FEATURES )
		// @ts-ignore
		.map( ( name ) => `${name}=${CURRENT_DEV_FEATURES[ name ]}` )
		.join( '&' );
};

/**
 * @param {Object} scenario
 * @param {string} scenario.url
 * @return {Object}
 */
const addFeatureFlagQueryStringsToScenario = ( scenario ) => {
	const hasQueryString = scenario.url.includes( '?' );
	const url = scenario.url;
	const qs = getFeatureQueryString();
	return Object.assign( {}, scenario, {
		url: hasQueryString ? `${url}&${qs}` : `${url}?${qs}`
	} );
};

/**
 * Modified configuration that outputs to a different directory.
 */
module.exports = Object.assign( {}, configDesktop, {
	scenarios: configDesktop.scenarios.map(
		( scenario ) => addFeatureFlagQueryStringsToScenario( scenario )
	),
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
	}
} );
