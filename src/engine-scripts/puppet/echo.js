const moduleReady = require( './moduleReady' );

/**
 * Setup Echo notifications
 *
 * @param {import('puppeteer').Page} page
 * @param {string[]} hashtags
 */
module.exports = async ( page, hashtags ) => {
	const requireLogin = hashtags.includes( '#logged-in' );
	// if anonymous nothing to do.
	if ( !requireLogin ) {
		return;
	}

	// Open the drawer for tests that require interaction
	if ( hashtags.includes( '#echo-drawer' ) ) {
		await moduleReady( page, 'ext.echo.init' );
		await page.evaluate( async () => {
			const btn = document.querySelector( '#pt-notifications-alert a' );
			btn.click();
		} );
		await moduleReady(
			page,
			hashtags.includes( '#mobile' ) ? 'ext.echo.mobile' : 'ext.echo.ui.desktop'
		);

		// Wait for the OOUI pending element to disappear.
		await page.waitForSelector( '.oo-ui-pendingElement-pending', {
			hidden: true
		} );
		// wait for a notification to appear if we're expecting them.
		// There should always be notifications, even for Admin user (one shows after first edit)
		await page.waitForSelector( '.mw-echo-ui-notificationItemWidget-content' );
	}
};
