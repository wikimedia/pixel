module.exports = {
	id: 'MediaWiki',
	asyncCaptureLimit: 8,
	engine: 'puppeteer',
	engineOptions: {
		headless: 'new',
		args: [
			'--no-sandbox',
			'--single-process',
			'--disable-dev-shm-usage'
		]
	},
	debug: false,
	debugWindow: false
};
