/**
 * Print details of scenario.
 *
 * @param {import('backstopjs').Scenario} scenario
 */
const printScenario = async (scenario) => {
	console.log('\nSCENARIO >');
	console.log('  ' + scenario.label);
	console.log('  ' + scenario.url);
	if (process.env.SCENARIO_DETAILS === '1') {
		console.log(JSON.stringify(scenario, null, 2));
	}
};

module.exports = printScenario;