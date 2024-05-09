module.exports = {
	id: 'MediaWiki',
	asyncCaptureLimit: 8,
	onBeforeScript: 'puppet/onBefore.js',
	onReadyScript: 'puppet/onReady.js',
	engine: 'puppeteer',
	engineOptions: {
		headless: 'new',
		args: [
			'--no-sandbox',
			'--single-process'
		]
	},
	debug: false,
	debugWindow: false
};
