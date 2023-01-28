const dropdownState = require( '../dropdownState' );

/**
 * Open or close Vector-2022's sidebar.
 *
 * @param {import('playwright').Page} page
 * @param {string[]} hashtags
 */
module.exports = async ( page, hashtags ) => {
	const isOpen = hashtags.includes( '#mainmenu-open' );
	const isClosed = hashtags.includes( '#mainmenu-closed' );

	if ( !isOpen && !isClosed ) {
		return;
	}

	await dropdownState( page, '#mw-mf-main-menu-button', isClosed );
};
