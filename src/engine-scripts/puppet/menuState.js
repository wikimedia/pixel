const fastForwardAnimations = require( './fastForwardAnimations' );

/**
 * Handles opening or closing a menu.
 *
 * @param {import('puppeteer').Page} page
 * @param {string} buttonSelector
 * @param {boolean} isClosed
 */
const menuState = async ( page, buttonSelector, isClosed ) => {
	await page.waitForSelector( buttonSelector );
	await page.evaluate( ( selector, isExpectedClosed ) => {
		const btn = document.querySelector( selector );
		const isCheckbox = btn.getAttribute( 'type' ) === 'checkbox';
		const checkbox = isCheckbox ?
			btn : document.getElementById( btn.getAttribute( 'for' ) );
		const isOpen = checkbox.checked;

		const toggle = () => {
			if ( isCheckbox ) {
				btn.checked = !btn.checked;
			} else {
				btn.dispatchEvent(
					new Event( 'click' )
				);
			}
		};
		if ( isExpectedClosed && isOpen ) {
			toggle();
		} else if ( !isExpectedClosed && !isOpen ) {
			toggle();
		}
	}, buttonSelector, isClosed );

	// Vector-2022 menus currently have transition animations when opened.
	fastForwardAnimations( page );
};

module.exports = menuState;
