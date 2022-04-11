const menuState = require( './menuState' );
module.exports = async (page, hashtags) => {
    const isClosed = hashtags.includes( '#userMenu-closed' );
    menuState(page, '#p-personal-checkbox', isClosed);
};
