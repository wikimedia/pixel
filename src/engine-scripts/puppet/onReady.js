module.exports = async (page, scenario, vp) => {
  console.log('SCENARIO > ' + scenario.label);
  const label = scenario.label;
  const hashtags = label.match( /(#[^ ,\)]*)/g) || [];
  await require('./clickAndHoverHelper')(page, scenario);

  // These only apply to Vector 2022
  if ( hashtags.includes( '#vector-2022' ) ) {
    await require('./sidebarState')(page, hashtags);
    await require('./userMenuState')(page, hashtags);
  }

  // Make sure the main skin JavaScript module has loaded.
  await require('./jsReady')(page);
  // add more ready handlers here...
};
