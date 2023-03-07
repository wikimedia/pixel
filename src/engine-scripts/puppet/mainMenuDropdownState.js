const dropdownState = require( './dropdownState' );

/**
 * Open or close Vector-2022's sidebar.
 *
 * @param {import('puppeteer').Page} page
 * @param {string[]} hashtags
 */
module.exports = async ( page, hashtags ) => {
	const isOpen = hashtags.includes( '#main-menu-open' );
	const isClosed = hashtags.includes( '#main-menu-closed' );

	if ( !isOpen && !isClosed ) {
		return;
	}

	await dropdownState( page, '#vector-main-menu-dropdown-checkbox, #mw-sidebar-button', isClosed );
};
