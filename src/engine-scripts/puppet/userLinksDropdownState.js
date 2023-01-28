const dropdownState = require( './dropdownState' );

/**
 * Open or close Vector-2022's user menu.
 *
 * @param {import('playwright').Page} page
 * @param {string[]} hashtags
 */
module.exports = async ( page, hashtags ) => {
	const isOpen = hashtags.includes( '#user-links-open' );
	const isClosed = hashtags.includes( '#user-links-closed' );

	if ( !isOpen && !isClosed ) {
		return;
	}

	await dropdownState( page, '#vector-user-links-dropdown-label', isClosed );
};
