const deferToFrame = require( './deferToFrame' );
const fastForwardAnimations = require( './fastForwardAnimations' );
const waitForIdle = require( './waitForIdle' );
const clickBtn = require( './clickBtn' );

/**
 * Runs after onReady event on all scenarios -- use for simulating interactions.
 *
 * @param {import('puppeteer').Page} page
 * @param {import('backstopjs').Scenario} scenario
 */
module.exports = async ( page, scenario ) => {
	console.log( 'SCENARIO > ' + scenario.label );
	const label = scenario.label;
	const hashtags = label.match( /(#[^ ,)]*)/g ) || [];

	// Make sure the main skin JavaScript module has loaded.
	await require( './jsReady' )( page, hashtags );

	// These only apply to Vector 2022
	if ( hashtags.includes( '#vector-2022' ) ) {
		await require( './limitedWidth' )( page, hashtags );
		await require( './pinnableElementState' )( page, hashtags, 'main-menu' );
		await require( './pinnableElementState' )( page, hashtags, 'page-tools' );
		await require( './pinnableElementState' )( page, hashtags, 'toc' );
		// Only 1 dropdown can be open at time
		await require( './userLinksDropdownState' )( page, hashtags );
		await require( './mainMenuDropdownState' )( page, hashtags );
		await require( './pageToolsDropdownState' )( page, hashtags );
		await require( './tocDropdownState' )( page, hashtags );
	}

	if ( hashtags.includes( '#toggle-toc-subsections' ) ) {
		await require( './toggleTocSubsections' )( page );
	}

	// These only apply to Minerva
	if ( hashtags.includes( '#minerva' ) ) {
		await require( './minerva/mainMenuState' )( page, hashtags );

		// Run click handlers if necessary.
		if ( hashtags.includes( '#click-edit' ) ) {
			await clickBtn( page, '#ca-edit, #ca-editsource', '.editor-container, .ve-ui-surface' );
		}
		if ( hashtags.includes( '#click-language' ) ) {
			await clickBtn( page, '#language-selector a' );
		}
		if ( hashtags.includes( '#click-watch' ) ) {
			await clickBtn( page, '#ca-watch' );
		}
		if ( hashtags.includes( '#click-redlink' ) ) {
			await clickBtn( page, 'a.new' );
		}
		if ( hashtags.includes( '#click-edit-suggestions' ) ) {
			await clickBtn( page, '.growthexperiments-homepage-module-header-nav-icon' );
		}
		if ( hashtags.includes( '#click-reference' ) ) {
			await clickBtn( page, '#cite_ref-1 a' );
		}
		if ( hashtags.includes( '#click-image' ) ) {
			await clickBtn( page, '.mw-parser-output .mw-file-element', '.image-loaded' );
		}
		if ( hashtags.includes( '#click-ambox' ) ) {
			await clickBtn( page, '.ambox' );
		}

		// Support for a generic click in the form #click[id=id])
		hashtags.map( ( hashtag ) => {
			const match = hashtag.match(/click\[id=([^\)]*)\]/);
			return match && match[1];
		} ).filter( ( selector ) => selector ).forEach( async ( selector ) => {
			await clickBtn( page, `#${selector}` );
		} );
	}

	// Run Echo handlers if necessary.
	if ( hashtags.includes( '#echo' ) ) {
		await require( './echo.js' )( page, hashtags );
	}

	if ( hashtags.includes( '#scroll' ) ) {
		await require( './scroll.js' )( page );
		// Anecdotally, browsers can take up to 3 repaints before painting the new
		// scroll position.
		await deferToFrame( page, 3 );

	}

	if ( hashtags.includes( '#search-focus' ) ) {
		await require( './search.js' )( page, hashtags );
	}

	// add more ready handlers here...
	// Note: These calls should always be last.

	// Wait for any images to finish loading.
	await page.waitForNetworkIdle();
	// Wait for the main thread to have an idle period.
	await waitForIdle( page );
	// Fast forward through any css transitions/web animations that are happening.
	await fastForwardAnimations( page );

	/**
	 * Remove the .sidebar-toc-list-item-active, .vector-toc-list-item-active
	 * class from the item in the toc What is focused is variable, so can lead to
	 * false positives in pixel.  Knowing it exists is enough to know it is
	 * working.
	 */
	await page.evaluate( () => {
		document.querySelectorAll(
			'.vector-toc-list-item-active'
		).forEach( ( node ) => {
			node.classList.remove(
				'vector-toc-list-item-active'
			);
		} );
		return true;
	} );
};
