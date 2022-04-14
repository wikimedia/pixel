const menuState = require( './menuState' );
module.exports = async (page, hashtags) => {
    const isClosed = !hashtags.includes( '#sidebar-open' );
    await menuState(page, '#mw-sidebar-button', isClosed);
};
