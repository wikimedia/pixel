const menuState = require( './menuState' );
module.exports = async (page, hashtags) => {
    const isOpen = hashtags.includes( '#userMenu-open' );
    const isClosed = hashtags.includes( '#userMenu-closed' );
    if ( !isOpen && !isClosed ) {
        // not applicable.
        return;
    }
    await menuState(page, '#p-personal-checkbox', isClosed);
};
