const menuState = require( './menuState' );
module.exports = async (page, hashtags) => {
    const isClosed = hashtags.includes( '#sidebar-closed' );
    menuState(page, '#mw-sidebar-button', isClosed);
};
