const REPORT_DIR = '/vrdata/pixel-report';

/**
 * Factory function that returns Backstop config based on a name for the group
 * of tests and a given set of scenarios.
 *
 * @param {string} group
 * @param {import("backstopjs").Scenario[]} scenarios
 * @return {import("backstopjs").Config}
 */
module.exports = ( group, scenarios ) => {
	return {
		id: group,
		viewports: [
			{
				label: 'phone',
				width: 320,
				height: 480
			},
			{
				label: 'tablet',
				width: 720,
				height: 768
			},
			{
				label: 'desktop',
				width: 1000,
				height: 900
			},
			{
				label: 'desktop-wide',
				width: 1792,
				height: 900
			}
		],
		onBeforeScript: 'puppet/onBefore.js',
		onReadyScript: 'puppet/onReady.js',
		scenarios,
		paths: {
			// eslint-disable-next-line camelcase
			bitmaps_reference: `${REPORT_DIR}/reference-screenshots-${group}`,
			// eslint-disable-next-line camelcase
			bitmaps_test: `${REPORT_DIR}/test-screenshots-${group}`,
			// eslint-disable-next-line camelcase
			engine_scripts: 'src/engine-scripts',
			// eslint-disable-next-line camelcase
			html_report: `${REPORT_DIR}/${group}`
		},
		report: [],
		engine: 'puppeteer',
		engineOptions: {
			args: [
				'--no-sandbox'
			]
		},
		asyncCaptureLimit: 5,
		asyncCompareLimit: 50,
		debug: false,
		debugWindow: false
	};
};
