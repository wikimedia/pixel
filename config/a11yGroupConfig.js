module.exports = {
	desktop: {
		name: 'Vector 2022 accessibility',
		priority: 2,
		a11y: true,
		logResults: true,
		config: 'configDesktopA11y.js'
	},
	mobile: {
		name: 'Minerva and MobileFrontend accessibility',
		priority: 2,
		a11y: true,
		logResults: true,
		config: 'configMobileA11y.js'
	}
};
