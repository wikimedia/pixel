const configDesktop = require( './configDesktop.js' );
const utils = require( '../utils' );

const skinScenarios = utils.makeScenariosForSkins( [
	{
		label: 'Community skin test',
		path: '/wiki/Test',
		hashtags: [],
		selectors: [ 'viewport' ]
	}
], [ 'timeless', 'modern', 'cologneblue', 'monobook' ] );

const quickSurveyScenarios = utils.makeScenariosForSkins(
	[
		{
			label: 'QuickSurvey with buttons',
			path: '/wiki/Test',
			hashtags: [ '#scroll', '#quicksurvey' ],
			query: {
				quicksurvey: 'external example survey'
			},
			selectors: [ '.ext-quick-survey-panel' ]
		},
		{
			label: 'QuickSurvey with single answer',
			path: '/wiki/Test',
			hashtags: [ '#scroll', '#quicksurvey' ],
			query: {
				quicksurvey: 'internal example survey'
			},
			selectors: [ '.ext-quick-survey-panel' ]
		},
		{
			label: 'QuickSurvey with multiple answers',
			path: '/wiki/Test',
			hashtags: [ '#scroll', '#quicksurvey' ],
			query: {
				quicksurvey: 'internal multi answer example survey'
			},
			selectors: [ '.ext-quick-survey-panel' ]
		}
	],
	[ 'vector', 'vector-2022', 'minerva' ]
);

const nearbyScenarios = utils.makeScenariosForSkins(
	[
		{
			label: 'Nearby the WMF office',
			path: '/wiki/Special:Nearby',
			hash: '#/coord/37.789167,-122.403333',
			hashtags: [ '#nearby' ],
			selectors: [ '#mw-content-text' ]
		},
		{
			label: 'Nearby error state',
			path: '/wiki/Special:Nearby',
			hash: '#/coord/0,-700',
			hashtags: [ '#nearby', ' #nearby-error' ],
			selectors: [ '#mw-content-text' ]
		}
	],
	[ 'vector', 'vector-2022', 'minerva' ]
);

module.exports = Object.assign( {}, configDesktop, {
	id: 'web-maintained',
	scenarios: skinScenarios.concat( quickSurveyScenarios ).concat(
		nearbyScenarios
	),
	paths: utils.makePaths( 'web-maintained' )
} );
