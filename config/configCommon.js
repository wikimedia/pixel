const config = {
	id: 'MediaWiki',
	asyncCaptureLimit: 4,
	asyncCompareLimit: 25,
	protocolTimeout: 45000,
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

const deepMerge = (target, source) => {
  Object.keys(source).forEach(key => {
    const sourceValue = source[key];
    if (Array.isArray(target[key]) && Array.isArray(sourceValue)) {
      target[key] = [...new Set([...target[key], ...sourceValue])];
    } else if (sourceValue && typeof sourceValue === 'object') {
      target[key] = deepMerge(target[key] ?? {}, sourceValue);
    } else {
      target[key] = sourceValue;
    }
  });
  return target;
};

if ( process.env.WATCH_MODE === '1' ) {
  deepMerge(config, watchConfig);
}

console.log('-----------------------------');
console.log('Current common configuration:');
console.log(JSON.stringify(config, null, 2));
console.log('-----------------------------');

module.exports = config;