const moduleReady = require( './moduleReady' );

/**
 *
 * @param {number} time
 * @return {Promise}
 */
const delay = ( time ) => {
	return new Promise( function ( resolve ) {
		setTimeout( resolve, time );
	} );
};

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
		const expectsNotifications = hashtags.includes( '#echo-100' ) || hashtags.includes( '#echo-1' );

		// Wait for the OOUI pending element to disappear.
		await page.waitForSelector( '.oo-ui-pendingElement-pending', {
			hidden: true
		} );
		// wait for a notification to appear if we're expecting them.
		if ( expectsNotifications ) {
			await page.waitForSelector( '.mw-echo-ui-notificationItemWidget-content, ' );
		} else {
			// Check for the "There are no notifications" message.
			// Annoyingly there is no unique selector we can use, so we must use a delay
			// to avoid false positives.
			await delay( 5000 );
		}

	}
};
