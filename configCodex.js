const utils = require( './utils' );
const {
	VIEWPORT_PHONE,
	VIEWPORT_TABLET,
	VIEWPORT_DESKTOP
} = require( './viewports' );

// List of all components currently documented in the VueTest extension's Sandbox page.
// Dialog is left out because all Dialog demos require interaction to test properly.
// TODO: Add Link and ProgressBar once their demos are added to the codex-demos package.
const components = [
	'button',
	'button-group',
	'card',
	'checkbox',
	'combobox',
	'icon',
	'lookup',
	'menu',
	'menu-item',
	'message',
	'radio',
	'search-input',
	'select',
	'tabs',
	'text-input',
	'thumbnail',
	'toggle-button',
	'toggle-button-group',
	'toggle-switch',
	'typeahead-search'
];

const scenarios = utils.makeScenariosForSkins(
	components.map( ( component ) => {
		return {
			label: 'cdx-' + component,
			path: '/wiki/Special:VueTest/codex',
			selectors: [ '.cdx-sandbox__content #cdx-' + component ],
			removeSelectors: [ '.cdx-sandbox__nav', `main > section:not(#cdx-${component}` ],
			misMatchThreshold: 1
		};
	} ),
	// TODO: add interactive tests for Dialog, clearable Input, and maybe TypeaheadSearch
	[ 'vector-2022', 'minerva' ]
);

module.exports = {
	id: 'MediaWiki',
	viewports: [
		VIEWPORT_PHONE,
		VIEWPORT_TABLET,
		VIEWPORT_DESKTOP
	],
	onBeforeScript: 'puppet/onBefore.js',
	onReadyScript: 'puppet/onReady.js',
	scenarios,
	paths: utils.makePaths( 'codex' ),
	report: [],
	engine: 'puppeteer',
	engineOptions: {
		args: [
			'--no-sandbox'
		]
	},
	asyncCaptureLimit: 10,
	asyncCompareLimit: 50,
	debug: false,
	debugWindow: false
};
