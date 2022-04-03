const BASE_URL = `http://mediawiki-web:8080`;
const tests = require('../config.json').tests;

const scenarios = tests.map( test => {
  return Object.assign( {}, test, {
    url: `${BASE_URL}${test.path}`,
    delay: 1500
  } );
} );

module.exports = {
  "id": "MediaWiki",
  "viewports": [
    {
      "label": "phone",
      "width": 320,
      "height": 480
    },
    {
      "label": "tablet",
      "width": 720,
      "height": 768
    },
    {
      "label": "desktop",
      "width": 1000,
      "height": 900
    },
    {
      "label": "desktop-wide",
      "width": 1792,
      "height": 900 
    }
  ],
  "onBeforeScript": "puppet/onBefore.js",
  "onReadyScript": "puppet/onReady.js",
  scenarios,
  "paths": {
    "bitmaps_reference": "backstop_data/bitmaps_reference",
    "bitmaps_test": "backstop_data/bitmaps_test",
    "engine_scripts": "backstop_data/engine_scripts",
    "html_report": "backstop_data/html_report",
    "ci_report": "backstop_data/ci_report"
  },
  "report": [],
  "engine": "puppeteer",
  "engineOptions": {
    "args": [
      "--no-sandbox"
    ]
  },
  "asyncCaptureLimit": 5,
  "asyncCompareLimit": 50,
  "debug": false,
  "debugWindow": false
}
