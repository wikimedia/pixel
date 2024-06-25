module.exports = {
	id: 'MediaWiki',
	asyncCaptureLimit: 4,
	asyncCompareLimit: 25,
	engine: 'puppeteer',
	engineOptions: {
		headless: 'new',
		protocolTimeout: 30000,
		args: [
			'--no-sandbox',
			'--disable-setuid-sandbox',
			'--single-process',
			'--shm-size=1gb',
			'--disable-gpu',
			'--disable-gpu-sandbox'
		]
	},
	debug: false,
	debugWindow: false,
	delay: 100
};
