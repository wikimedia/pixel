const BASE_URL = process.env.MW_SERVER;

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
 * @property {Object} [query]
 * @property {string[]} [hashtags]
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
				return Object.assign( {}, test, {
					label: `${test.label} (${hashtagString})`,
					url: `${BASE_URL}${test.path}${qs}`
				} );
			} )
		);
	} );
	return scenarios;
};

module.exports = {
	makeScenariosForSkins,
	makePaths,
	addFeatureFlagQueryStringsToScenario
};
