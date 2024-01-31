const BASE_URL = process.env.PIXEL_MW_SERVER;

/**
 * @param {Object} featureFlags
 * @return {string}
 */
const getFeatureQueryString = ( featureFlags ) => {
	return Object.keys( featureFlags )
		// @ts-ignore
		.map( ( name ) => `${name}=${featureFlags[ name ]}` )
		.join( '&' );
};

/**
 * @param {string} path
 * @return {Object}
 */
const makePaths = ( path ) => {
	return {
		// eslint-disable-next-line camelcase
		bitmaps_reference: `report/reference-screenshots-${path}`,
		// eslint-disable-next-line camelcase
		bitmaps_test: `report/test-screenshots-${path}`,
		// eslint-disable-next-line camelcase
		engine_scripts: 'src/engine-scripts',
		// eslint-disable-next-line camelcase
		html_report: `report/${path}`,
		// eslint-disable-next-line camelcase
		ci_report: 'report/ci-report-dev',
		// eslint-disable-next-line camelcase
		json_report: 'report/json-report-dev'
	};
};

/**
 * @param {string} path
 * @return {Object}
 */
const makeA11yPaths = ( path ) => {
	return {
		// eslint-disable-next-line camelcase
		a11y_reference: `report-a11y/reference-json-${path}`,
		// eslint-disable-next-line camelcase
		a11y_test: `report-a11y/test-json-${path}`,
		// eslint-disable-next-line camelcase
		a11y_report: `report-a11y/${path}`
	};
};

/**
 * @param {Object} scenario
 * @param {string} scenario.url
 * @param {Object} featureFlags
 * @return {Object}
 */
const addFeatureFlagQueryStringsToScenario = ( scenario, featureFlags ) => {
	const hasQueryString = scenario.url.includes( '?' );
	const url = scenario.url;
	const qs = getFeatureQueryString( featureFlags );
	return Object.assign( {}, scenario, {
		url: hasQueryString ? `${url}&${qs}` : `${url}?${qs}`
	} );
};

/**
 * @typedef {Object} Test
 * @property {string} path
 * @property {string} [hash]
 * @property {Object} [query]
 * @property {string[]} [hashtags]
 * @property {number} [misMatchThreshold]
 * @property {string} label
 * @property {string[]} selectors
 *
 * @param {Test[]} tests
 * @param {string[]} skins to test on
 * @return {Object[]} scenarios
 */
const makeScenariosForSkins = ( tests, skins ) => {
	let /** @type {Object[]} */ scenarios = [];
	skins.forEach( ( useskin ) => {
		scenarios = scenarios.concat(
			tests.map( ( test ) => {
				const hashtagString = `${( test.hashtags || [] ).join( ' ' )} #${useskin}`.trim();
				const query = Object.assign( {}, test.query, { useskin } );
				const qs = Object.keys( query ).length ? `?${getFeatureQueryString( query )}` : '';
				const hash = test.hash || '';
				return Object.assign( {}, test, {
					label: `${test.label} (${hashtagString})`,
					url: `${BASE_URL}${test.path}${qs}${hash}`
				} );
			} )
		);
	} );
	return scenarios;
};

module.exports = {
	makeScenariosForSkins,
	makePaths,
	makeA11yPaths,
	addFeatureFlagQueryStringsToScenario
};
