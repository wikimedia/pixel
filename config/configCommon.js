module.exports = {
	id: 'MediaWiki',
	asyncCaptureLimit: 10,
	onBeforeScript: 'puppet/onBefore.js',
	onReadyScript: 'puppet/onReady.js',
	engine: 'puppeteer',
	engineOptions: {
		headless: 'new',
		args: [
			'--no-sandbox'
		]
	},
	debug: false,
	debugWindow: false
};
