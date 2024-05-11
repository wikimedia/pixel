module.exports = {
	id: 'MediaWiki',
	asyncCaptureLimit: 4,
	asyncCompareLimit: 25,
	engine: 'puppeteer',
	engineOptions: {
		headless: 'new',
		args: [
			'--no-sandbox',
			'--disable-setuid-sandbox',
			'--single-process',
			'--disable-dev-shm-usage'
		]
	},
	debug: false,
	debugWindow: false,
	delay: 500
};
