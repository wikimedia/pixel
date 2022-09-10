module.exports = async ( page ) => {
	await page.evaluate( () => {
		window.scrollBy( 0, window.innerHeight );
		return true;
	} );
	// wait for bolding of active section or toc collapsed button
	await page.waitForSelector( '.sidebar-toc-list-item-active, #vector-toc-collapsed-button', {
		visible: true
	} );

	// Wait for the scroll to settle - as it has side effects on things like the
	// table of contents bolding of sections.
	// Forgive us Nick.
	// eslint-disable-next-line no-restricted-properties
	await page.waitForTimeout( 2500 );
};
