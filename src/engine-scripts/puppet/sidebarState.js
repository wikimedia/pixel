const menuState = require( './menuState' );
module.exports = async ( page, hashtags ) => {
	const isOpen = hashtags.includes( '#sidebar-open' );
	const isClosed = hashtags.includes( '#sidebar-closed' );

	if ( !isOpen && !isClosed ) {
		return;
	}

	await menuState( page, '#mw-sidebar-button', isClosed );
};
