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
		'color-contrast',
		'WCAG2AA.Principle2.Guideline2_4.2_4_1.G1,G123,G124.NoSuchID'
	],
	hideElements: '#bodyContent, #siteNotice',
	chromeLaunchConfig: {
		headless: true,
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
			url: BASE_URL + '/wiki/Test',
			...testDefaults
		},
		{
			name: 'logged_in',
			url: BASE_URL + '/wiki/Test',
			...testDefaults
		}
	]
};
