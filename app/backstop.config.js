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
      "url": `${BASE_URL}/wiki/Main_Page`,
      // Apply a 500ms delay for the dancing tabs.
      "delay": 1500
    },
    {
      "label": "Test (vector-2022)",
      "url": `${BASE_URL}/wiki/Test`,
      "delay": 1500
    },
    {
      "label": "Test?action=History (vector-2022)",
      "url": `${BASE_URL}/w/index.php?title=Test&action=history`,
      "delay": 1500
    },
    {
      "label": "Talk:Test (vector-2022)",
      "url": `${BASE_URL}/wiki/Talk:Test`,
      "delay": 1500
    },
    {
      "label": "Tree (vector-2022)",
      "url": `${BASE_URL}/wiki/Tree`,
      "delay": 1500
    },
    // vector (legacy)
    {
      "label": "Main_Page (vector)",
      "url": `${BASE_URL}/wiki/Main_Page?useskin=vector`,
      "delay": 1500
    },
    {
      "label": "Test (vector)",
      "url": `${BASE_URL}/wiki/Test?useskin=vector`,
      "delay": 1500
    },
    {
      "label": "Test?action=History (vector)",
      "url": `${BASE_URL}/w/index.php?title=Test&action=history&useskin=vector`,
      "delay": 1500
    },
    {
      "label": "Talk:Test (vector)",
      "url": `${BASE_URL}/wiki/Talk:Test`,
      "delay": 1500
    },
    {
      "label": "Tree (vector)",
      "url": `${BASE_URL}/wiki/Tree?useskin=vector`,
      "delay": 1500
    },
  ],
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
