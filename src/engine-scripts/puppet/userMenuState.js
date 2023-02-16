const menuState = require( './menuState' );

/**
 * Open or close Vector-2022's user menu.
 *
 * @param {import('puppeteer').Page} page
 * @param {string[]} hashtags
 */
module.exports = async ( page, hashtags ) => {
	const isOpen = hashtags.includes( '#userMenu-open' );
	const isClosed = hashtags.includes( '#userMenu-closed' );

	if ( !isOpen && !isClosed ) {
		return;
	}

	await menuState( page, '#vector-user-links-dropdown-label, #p-personal-checkbox', isClosed );
};
