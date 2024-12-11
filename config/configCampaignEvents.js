const BASE_URL = process.env.PIXEL_MW_SERVER;
const configCommon = require( './configCommon' );
const utils = require( '../utils' );
const {
	VIEWPORT_PHONE,
	VIEWPORT_TABLET,
	VIEWPORT_DESKTOP,
	VIEWPORT_DESKTOP_WIDE,
	VIEWPORT_DESKTOP_WIDEST
} = require( '../viewports' );

const tests = [
	{
		label: 'Enable Event Registration (#logged-in)',
		path: '/wiki/Special:EnableEventRegistration'
	},
	{
		label: 'Event Page (#logged-in)',
		path: '/wiki/Event:1'
	},
	{
		label: 'Event Details tab (#logged-in)',
		path: '/wiki/Special:EventDetails/1'
	},
	{
		label: 'Participants tab (#logged-in)',
		path: '/w/index.php?title=Special:EventDetails/1&tab=ParticipantsPanel'
	},
  {
    label: 'Message tab (#logged-in)',
    path: '/w/index.php?title=Special:EventDetails/1&tab=EmailPanel'
  },
	{
		label: 'Delete Event Registration (#logged-in)',
		path: '/wiki/Special:DeleteEventRegistration/1'
	},
	{
		label: 'Edit Event Registration (#logged-in)',
		path: '/wiki/Special:EditEventRegistration/1'
	},
	{
		label: 'Register for Event (#logged-in)',
		path: '/wiki/Special:RegisterForEvent/5'
	},
	{
		label: 'Cancel Event Registration (#logged-in)',
		path: '/wiki/Special:CancelEventRegistration/6'
	},
	{
		label: 'My Events (#logged-in)',
		path: '/wiki/Special:MyEvents'
	},
	{
		label: 'All Events',
		path: '/wiki/Special:AllEvents'
	}
];

const scenarios = tests.map( ( test ) => {
	return {
		url: `${BASE_URL}${test.path}`,
		misMatchThreshold: 0.04,
		selectors: [ 'main' ],
		removeSelectors: [ '.vector-column-end' ],
		...test
	};
} );

module.exports = {
	...configCommon,
	id: 'campaign-events',
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
	paths: utils.makePaths( 'campaign-events' )
};
