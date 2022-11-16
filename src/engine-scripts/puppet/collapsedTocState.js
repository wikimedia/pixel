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

	const collapseTocButton = '.vector-toc-collapse-button';
	await page.waitForSelector( collapseTocButton );
	await page.evaluate( ( selector ) => {
		const btn = document.querySelector( selector );
		btn.click();
	}, collapseTocButton );

	const tocButtonSelector = isStickyHeader ? '#vector-sticky-header-toc-checkbox' : '#vector-toc-collapsed-button';
	await menuState( page, tocButtonSelector, isClosed );
};
