const menuState = require( './menuState' );

/**
 * Open or close Vector-2022's pinnable TOC.
 *
 * @param {import('puppeteer').Page} page
 * @param {string[]} hashtags
 */
module.exports = async ( page, hashtags ) => {
	const isOpen = hashtags.includes( '#unpinned-toc-open' );
	const isClosed = hashtags.includes( '#unpinned-toc-closed' );
	const isStickyHeader = hashtags.includes( '#scroll' ) && hashtags.includes( '#logged-in' );

	if ( !isOpen && !isClosed ) {
		return;
	}

	const unpinTocButton = '.vector-toc-pinnable-header .vector-pinnable-header-unpin-button';
	await page.waitForSelector( unpinTocButton );
	await page.evaluate( ( selector ) => {
		const btn = document.querySelector( selector );
		btn.click();
	}, unpinTocButton );

	const tocButtonSelector = isStickyHeader ? '#vector-sticky-header-toc-label' : '#vector-page-titlebar-toc-label,.client-nojs #vector-toc-collapsed-button';
	await menuState( page, tocButtonSelector, isClosed );
};
