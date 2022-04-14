const menuState = require( './menuState' );
module.exports = async (page, hashtags) => {
    const isClosed = hashtags.includes( '#sidebar-closed' );
    await menuState(page, '#mw-sidebar-button', isClosed);
};
