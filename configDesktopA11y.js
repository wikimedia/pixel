// @ts-nocheck
const utils = require( './utils' );

const namespace = 'desktop';
const baseUrl = process.env.PIXEL_MW_SERVER;

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
	namespace,
	paths: utils.makeA11yPaths( namespace ),
	tests: [
		{
			name: 'default',
			url: baseUrl + '/wiki/Test',
			...testDefaults
		},
		{
			name: 'logged_in',
			url: baseUrl + '/wiki/Test',
			...testDefaults
		}
	]
};
