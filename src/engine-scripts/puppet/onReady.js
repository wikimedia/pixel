module.exports = async (page, scenario, vp) => {
  console.log('SCENARIO > ' + scenario.label);
  const label = scenario.label;
  const hashtagsMatch = label.match( /(#[^ ]*)/g);
  const hashtags = hashtagsMatch ? hashtagsMatch[0] : [];
  await require('./clickAndHoverHelper')(page, scenario);

  // These only apply to Vector 2022
  if ( hashtags.includes( '#vector-2022' ) ) {
    await require('./sidebarState')(page, hashtags);
    await require('./userMenuState')(page, hashtags);
  }
  // add more ready handlers here...
};
