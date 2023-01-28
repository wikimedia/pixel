const dropdownState = require( './dropdownState' );

/**
 * Open or close Vector-2022's page tools dropdown
 *
 * @param {import('playwright').Page} page
 * @param {string[]} hashtags
 */
module.exports = async ( page, hashtags ) => {
	const isOpen = hashtags.includes( '#page-tools-open' );
	const isClosed = hashtags.includes( '#page-tools-closed' );
	if ( !isOpen && !isClosed ) {
		return;
	}

	await dropdownState( page, '.vector-page-tools-landmark input', isClosed );
};
