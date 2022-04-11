module.exports = async (page, scenario, vp) => {
  console.log('SCENARIO > ' + scenario.label);
  const label = scenario.label;
  const hashtagsMatch = label.match( /(#[^ ]*)/g);
  const hashTags = hashtagsMatch ? hashtagsMatch[0] : [];
  await require('./clickAndHoverHelper')(page, scenario);
  await require('./sidebarState')(page, hashTags);
  await require('./userMenuState')(page, hashTags);
  // add more ready handlers here...
};
