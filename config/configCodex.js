const utils = require( '../utils' );
const configCommon = require( './configCommon' );
const {
	VIEWPORT_PHONE,
	VIEWPORT_TABLET,
	VIEWPORT_DESKTOP
} = require( '../viewports' );

// List of all components on the Codex sandbox
// TODO ideally we would automate this based on what's actually in the sandbox
const components = [
	{
		label: 'Accordion',
		sandboxSection: 'accordion'
	},
	{
		label: 'Button',
		sandboxSection: 'button'
		// TODO also add a scenario that looks at the full button grid
		// This will require making the URL (or at least the index.html part of it) customizable
	},
	{
		label: 'Button group',
		sandboxSection: 'button-group'
	},
	{
		label: 'Card',
		sandboxSection: 'card'
	},
	{
		label: 'Checkbox',
		sandboxSection: 'checkbox'
	},
	{
		label: 'Chip input',
		sandboxSection: 'chip-input'
	},
	{
		label: 'Combobox',
		sandboxSection: 'combobox'
	},
	{
		label: 'Dialog',
		sandboxSection: 'dialog'
		// TODO put clickSelector or something here
	},
	{
		label: 'Field',
		sandboxSection: 'field'
	},
	{
		label: 'Icon',
		sandboxSection: 'icon'
		// TODO also add a scenario that looks at the full icon grid
	},
	{
		label: 'Label',
		sandboxSection: 'label'
	},
	{
		label: 'Link',
		sandboxSection: 'link'
	},
	{
		label: 'Lookup',
		sandboxSection: 'lookup'
	},
	{
		label: 'Menu',
		sandboxSection: 'menu'
	},
	{
		label: 'Menu item',
		sandboxSection: 'menu-item'
	},
	{
		label: 'Message',
		sandboxSection: 'message'
	},
	{
		label: 'Progress bar',
		sandboxSection: 'progress-bar'
	},
	{
		label: 'Radio',
		sandboxSection: 'radio'
	},
	{
		label: 'Search input',
		sandboxSection: 'search-input'
	},
	{
		label: 'Select',
		sandboxSection: 'select'
	},
	{
		label: 'Table',
		sandboxSection: 'table'
	},
	{
		label: 'Tabs',
		sandboxSection: 'tabs'
	},
	{
		label: 'Text area',
		sandboxSection: 'text-area'
	},
	{
		label: 'Text input',
		sandboxSection: 'text-input'
	},
	{
		label: 'Thumbnail',
		sandboxSection: 'thumbnail'
	},
	{
		label: 'Toggle button group',
		sandboxSection: 'toggle-button-group'
	},
	{
		label: 'Toggle',
		sandboxSection: 'toggle'
	},
	{
		label: 'TypeaheadSearch',
		sandboxSection: 'typeahead-search'
	}
];

const scenarios = components.map( ( componentData ) => {
	const { sandboxSection, ...otherData } = componentData;
	/** @type {string[]} */
	let selectors = [];
	/** @type {string[]} */
	let removeSelectors = [];
	if ( sandboxSection ) {
		selectors = [ `#cdx-${sandboxSection}` ];
		removeSelectors = [ `main section:not(#cdx-${sandboxSection})` ];
	}
	return {
		selectors,
		removeSelectors,
		...otherData,
		url: `${process.env.PIXEL_MW_SERVER}/w/codex/packages/codex/dist/sandbox/index.html`,
		misMatchThreshold: 1
	};
} );

module.exports = {
	...configCommon,
	viewports: [
		VIEWPORT_PHONE,
		VIEWPORT_TABLET,
		VIEWPORT_DESKTOP
	],
	scenarios,
	paths: utils.makePaths( 'codex' )
};
