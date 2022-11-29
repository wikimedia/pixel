const menuState = require( './menuState' );

/**
 * Open or close Vector-2022's collapsible TOC.
 *
 * @param {import('puppeteer').Page} page
 * @param {string[]} hashtags
 */
module.exports = async ( page, hashtags ) => {
	const isOpen = hashtags.includes( '#collapsed-toc-open' );
	const isClosed = hashtags.includes( '#collapsed-toc-closed' );
	const isStickyHeader = hashtags.includes( '#scroll' ) && hashtags.includes( '#logged-in' );

	if ( !isOpen && !isClosed ) {
		return;
	}

	// vector-pinnable-header-toggle-button is used in VectorPageTools=1
	const collapseTocButton = '.vector-toc-collapse-button,.vector-toc-pinnable-header .vector-pinnable-header-unpin-button';
	await page.waitForSelector( collapseTocButton );
	await page.evaluate( ( selector ) => {
		const btn = document.querySelector( selector );
		btn.click();
	}, collapseTocButton );

	const tocButtonSelector = isStickyHeader ? '#vector-sticky-header-toc-label' : '#vector-page-titlebar-toc-label';
	await menuState( page, tocButtonSelector, isClosed );
};
