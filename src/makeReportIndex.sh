#!/bin/bash

set -eu

function makeReport() {
    local filePath="$1"
    local html="$2"

    local docHTML=$(cat <<EOF
<!DOCTYPE HTML>
<html>
  <head>
    <title>UI regression reports</title>
    <meta name="viewport" content="width=device-width, initial-scale=1.0, user-scalable=yes, minimum-scale=0.25, maximum-scale=5.0"/>
  </head>
  <body>
    <h1>UI regression reports</h1>
    <p>This page is automatically updated by the command: <pre>node pixel.js runAll</pre></p>
    <p>Page was last generated on: $(date)</p>
    <p>Using Pixel $(git describe --tags)</p>
    <h2>Available reports</h2>
    <ul>
      ${html}
    </ul>
  </body>
</html>
EOF
)

    echo "${docHTML}" > "${filePath}"
    echo "${filePath}"
}

export -f makeReport