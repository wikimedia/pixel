const fs = require( 'fs' );

/**
 *
 * @param {string} directory
 * @param {string} html
 * @return {string}
 */
function makeReport( directory, html ) {
	const docHTML = `<!DOCTYPE HTML>
<html>
	<head>
		<title>UI regression reports</title>
		<meta name="viewport" content="width=device-width, initial-scale=1.0, user-scalable=yes, minimum-scale=0.25, maximum-scale=5.0"/>
	</head>
	<body>
		<h1>UI regression reports</h1>
		<p>This page is automatically updated by the command: <pre>node pixel.js runAll</pre></p>
		<p>Page was last generated on: ${new Date()}</p>
		<h2>Available reports</h2>
		<ul>
			${html}
		</ul>
	</body>
</html>
`;
	const path = `${directory}/index.html`;
	fs.writeFileSync( path, docHTML );
	return path;
}

module.exports = makeReport;
