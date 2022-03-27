const BASE_URL = `http://mediawiki-web:8080`;

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
  "scenarios": [
    // vector-2022
    {
      "label": "Main_Page (vector-2022)",
      "url": `${BASE_URL}/wiki/Main_Page`
    },
    {
      "label": "Test (vector-2022)",
      "url": `${BASE_URL}/wiki/Test`
    },
    {
      "label": "Test?action=History (vector-2022)",
      "url": `${BASE_URL}/w/index.php?title=Test&action=history`
    },
    {
      "label": "Talk:Test (vector-2022)",
      "url": `${BASE_URL}/wiki/Talk:Test`
    },
    {
      "label": "Tree (vector-2022)",
      "url": `${BASE_URL}/wiki/Tree`
    },
    // vector (legacy)
    {
      "label": "Main_Page (vector)",
      "url": `${BASE_URL}/wiki/Main_Page?useskin=vector`
    },
    {
      "label": "Test (vector)",
      "url": `${BASE_URL}/wiki/Test?useskin=vector`
    },
    {
      "label": "Test?action=History (vector)",
      "url": `${BASE_URL}/w/index.php?title=Test&action=history&useskin=vector`
    },
    {
      "label": "Talk:Test (vector)",
      "url": `${BASE_URL}/wiki/Talk:Test`
    },
    {
      "label": "Tree (vector)",
      "url": `${BASE_URL}/wiki/Tree?useskin=vector`
    },
  ],
  "paths": {
    "bitmaps_reference": "backstop_data/bitmaps_reference",
    "bitmaps_test": "backstop_data/bitmaps_test",
    "engine_scripts": "backstop_data/engine_scripts",
    "html_report": "backstop_data/html_report",
    "ci_report": "backstop_data/ci_report"
  },
  "report": [
    "browser"
  ],
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
