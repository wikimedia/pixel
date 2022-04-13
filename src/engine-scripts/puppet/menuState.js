const menuState = async (page, buttonSelector, isClosed) => {
    await page.waitForSelector(buttonSelector);
    await page.evaluate((selector, isExpectedClosed)  => {
      const btn = document.querySelector(selector);
      const checkbox = btn.getAttribute('type') === 'checkbox' ?
       btn : document.getElementById(btn.getAttribute('for'));
      const isOpen = checkbox.checked;

      if ( isExpectedClosed && isOpen ) {
        btn.dispatchEvent(
            new Event( 'click' )
        );
      } else if ( !isExpectedClosed && !isOpen ) {
          btn.dispatchEvent(
            new Event( 'click' )
          )
      }
    }, buttonSelector, isClosed);
};
module.exports = menuState;
