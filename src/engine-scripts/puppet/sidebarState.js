const menuState = require( './menuState' );

/**
 * Open or close Vector-2022's sidebar.
 *
 * @param {import('puppeteer').Page} page
 * @param {string[]} hashtags
 */
module.exports = async ( page, hashtags ) => {
	const isOpen = hashtags.includes( '#sidebar-open' );
	const isClosed = hashtags.includes( '#sidebar-closed' );

	if ( !isOpen && !isClosed ) {
		return;
	}

	await menuState( page, '#mw-sidebar-button', isClosed );
};
