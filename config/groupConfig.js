/**
 * Each group has an assigned priority based on how regular they need to run.
 * For suites with lots of test where code seldom changes priority 2 and 3 are
 * preferred. Feel free to modify these as development priorities shift.
 * Priority 1 - run every hour
 * Priority 2 - run every 12 hours
 * Priority 3 - run every 24 hours
 */
module.exports = {
	login: {
		name: 'Login and sign up pages',
		priority: 3,
		config: 'configLogin.js'
	},
	'web-maintained': {
		name: 'Extensions and skins maintained by web team',
		priority: 3,
		config: 'configWebMaintained.js'
	},
	echo: {
		name: 'Echo badges',
		priority: 3,
		config: 'configEcho.js'
	},
	'desktop-dev': {
		name: 'Zebra Vector 2022 skin',
		priority: 3,
		config: 'configDesktopDev.js'
	},
	desktop: {
		name: 'Vector 2022 skin',
		priority: 1,
		config: 'configDesktop.js'
	},
	mobile: {
		name: 'Minerva and MobileFrontend',
		priority: 1,
		config: 'configMobile.js'
	},
	'campaign-events': {
		priority: 2,
		config: 'configCampaignEvents.js'
	},
	codex: {
		priority: 1,
		config: 'configCodex.js'
	},
	wikilambda: {
		priority: 2,
		config: 'configWikiLambda.js'
	}
};
