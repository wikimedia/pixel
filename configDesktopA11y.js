// @ts-nocheck
const utils = require( './utils' );

const NAMESPACE = 'desktop';
const BASE_URL = process.env.PIXEL_MW_SERVER;

const testDefaults = {
	viewport: {
		width: 1200,
		height: 1080
	},
	runners: [
		'axe',
		'htmlcs'
	],
	includeWarnings: true,
	includeNotices: true,
	ignore: [
		// Prevent contrast ratio error on absolutely positioned elements
		'WCAG2AA.Principle1.Guideline1_4.1_4_3.G18.Abs'
	],
	chromeLaunchConfig: {
		headless: 'new',
		args: [
			'--no-sandbox',
			'--disable-setuid-sandbox'
		]
	}
};

module.exports = {
	namespace: NAMESPACE,
	paths: utils.makeA11yPaths( NAMESPACE ),
	tests: [
		{
			name: 'default',
			url: BASE_URL + '/wiki/Test?useskin=vector-2022',
			...testDefaults
		},
		{
			name: 'logged_in',
			url: BASE_URL + '/wiki/Test?useskin=vector-2022',
			...testDefaults
		}
	]
};
