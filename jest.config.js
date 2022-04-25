/*
 * For a detailed explanation regarding each configuration property, visit:
 * https://jestjs.io/docs/configuration
 */

module.exports = {
	// Automatically clear mock calls, instances and results before every test
	clearMocks: true,

	// Automatically restore mock state and implementation before every test.
	restoreMocks: true,

	// Indicates whether the coverage information should be collected while executing the test
	collectCoverage: true,

	// An array of glob patterns indicating a set of files for which coverage
	// information should be collected
	collectCoverageFrom: [
		'src/*.js'
	],

	coverageDirectory: 'coverage',

	// An array of regexp pattern strings used to skip coverage collection
	coveragePathIgnorePatterns: [
		'/node_modules/'
	]
};
