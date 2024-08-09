const config = {
	id: 'MediaWiki',
	asyncCaptureLimit: 4,
	asyncCompareLimit: 25,
	protocolTimeout: 45000,
	engine: 'puppeteer',
	engineOptions: {
		headless: true,
		args: [
      '--no-sandbox',                         // Disable the sandbox for all processes
      '--disable-setuid-sandbox',             // Disable the setuid sandbox
      '--disable-dev-shm-usage',              // Use /tmp instead of /dev/shm
      '--disable-gpu',                        // Disable GPU hardware acceleration
      '--disable-gpu-sandbox',                // Disable the GPU sandbox
      '--disk-cache-dir=/dev/null',           // Disable disk cache
      '--disable-background-networking',      // Disable background networking
      '--disable-background-timer-throttling',// Disable background timer throttling
      '--disable-backgrounding-occluded-windows', // Disable backgrounding of occluded windows
      '--disable-client-side-phishing-detection', // Disable client-side phishing detection
      '--disable-default-apps',               // Disable Chrome's default apps
      '--disable-hang-monitor',               // Disable the hang monitor
      '--disable-popup-blocking',             // Disable popup blocking
      '--disable-prompt-on-repost',           // Disable prompt on repost
      '--disable-sync',                       // Disable synchronization services
      '--disable-translate',                  // Disable Chrome translation features
      '--metrics-recording-only',             // Only record metrics, don't send them
      '--no-first-run',                       // Skip the first run tasks
      '--safebrowsing-disable-auto-update',   // Disable Safe Browsing auto-update
      '--no-zygote',                          // Disable the Zygote process
      '--disable-crash-reporter',             // Disable crash reporting
      '--disable-metrics',                    // Disable metrics collection
      '--disable-metrics-reporter',           // Disable metrics reporting
      '--disable-software-rasterizer',        // Disable software rasterizer
      '--mute-audio',                         // Mute audio
      '--disable-infobars',                   // Disable infobars
      '--disable-notifications',              // Disable notifications
      '--disable-desktop-notifications'       // Disable desktop notifications
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