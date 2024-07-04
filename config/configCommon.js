const config = {
	id: 'MediaWiki',
	asyncCaptureLimit: 4,
	asyncCompareLimit: 25,
	engine: 'puppeteer',
	engineOptions: {
		headless: true,
		args: [
			'--no-sandbox',
			'--disable-setuid-sandbox',
			'--disable-dev-shm-usage',
			'--disable-gpu',
			'--disable-gpu-sandbox'
		]
	},
	debug: false,
	debugWindow: false,
	delay: 100
};

const watchConfig = {
  asyncCaptureLimit: 1,
  engineOptions: {
    headless: false,
    slowMo: 100,
  },
  delay: 1000
};

const isWatchMode = () => process.env.WATCH_MODE === '1';

function deepMerge(target, source) {
  for (const key in source) {
    if (source.hasOwnProperty(key)) {
      if (source[key] && typeof source[key] === 'object') {
        target[key] = deepMerge(target[key] || {}, source[key]);
      } else {
        target[key] = source[key];
      }
    }
  }
  return target;
}

if (isWatchMode()) {
  deepMerge(config, watchConfig);
}

console.log('-----------------------------');
console.log('Current common configuration:');
console.log(JSON.stringify(config, null, 2));
console.log('-----------------------------');

module.exports = config;