const utils = require( '../utils' );
const configCommon = require( './configCommon' );

const {
	VIEWPORT_PHONE,
	VIEWPORT_TABLET,
	VIEWPORT_DESKTOP,
	VIEWPORT_DESKTOP_WIDE,
	VIEWPORT_DESKTOP_WIDEST
} = require( '../viewports' );

const scenarios = utils.makeScenariosForSkins( [
	{
		label: 'Login',
		path: '/wiki/Special:UserLogin',
		hashtags: [],
		selectors: [ 'viewport' ]
	},
	{
		label: 'Create account',
		path: '/wiki/Special:CreateAccount',
		hashtags: [],
		selectors: [ 'viewport' ]
	},
	{
		label: 'login when logged in',
		hashtags: [ 'logged-in' ],
		path: '/wiki/Special:UserLogin',
		selectors: [ 'viewport' ]
	},
	{
		label: 'create account when logged in',
		hashtags: [ 'logged-in' ],
		path: '/wiki/Special:CreateAccount',
		selectors: [ 'viewport' ]
	}
], [ 'vector-2022', 'vector', 'minerva' ] ).map( ( s ) => Object.assign( {}, s, {
	misMatchThreshold: 0.05
} ) );

module.exports = {
	...configCommon,
	onBeforeScript: 'puppet/onBefore.js',
	onReadyScript: 'puppet/onReady.js',
	viewports: [
		VIEWPORT_PHONE,
		VIEWPORT_TABLET,
		VIEWPORT_DESKTOP,
		VIEWPORT_DESKTOP_WIDE,
		VIEWPORT_DESKTOP_WIDEST
	],
	scenarios,
	paths: utils.makePaths( 'login' )
};
