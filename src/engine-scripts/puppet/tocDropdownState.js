const dropdownState = require( './dropdownState' );

/**
 * Open or close Vector-2022's collapsible TOC.
 *
 * @param {import('playwright').Page} page
 * @param {string[]} hashtags
 */
module.exports = async ( page, hashtags ) => {
	const isOpen = hashtags.includes( '#toc-open' );
	const isClosed = hashtags.includes( '#toc-closed' );

	if ( !isOpen && !isClosed ) {
		return;
	}

	const isStickyHeader = hashtags.includes( '#scroll' ) && hashtags.includes( '#logged-in' );
	const tocButtonSelector = isStickyHeader ?
		'#vector-sticky-header-toc-checkbox' :
		'.client-js #vector-page-titlebar-toc-checkbox,.client-nojs #vector-toc-collapsed-button';
	await dropdownState( page, tocButtonSelector, isClosed );
};
