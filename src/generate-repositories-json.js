/* eslint-disable node/no-unsupported-features/node-builtins */
/* eslint-disable no-undef */

/**
 * To use this script:
 *
 * 1) Go to https://en.wikipedia.org/wiki/Special:Version
 * 2) Copy and paste this entire script into your dev console
 * 3) A file named repositories.json should be downloaded.
 *
 * These are all the enabled extensions and skins from English Wikipedia
 * excluding those found in the `EXCLUDE_MAP`.
 */

/**
 * The following are repos that require more effort to setup than a simple
 * `wfLoadExtension` or `wfLoadSkin` line.
 */
const EXCLUDE_MAP = /** @type {Object.<string, true>} */ ( {
	'extensions/Wikibase': true,
	'extensions/WikibaseLexeme': true,
	'extensions/OAuth': true,
	'extensions/FlaggedRevs': true,
	'extensions/CentralAuth': true,
	'extensions/TheWikipediaLibrary': true,
	'extensions/GlobalBlocking': true,
	'extensions/ORES': true
} );

/**
 * @param {string} type
 * @return {string[]}
 */
function queryRepos( type ) {
	return Array.from(
		// @ts-ignore
		document.querySelectorAll( `[href*="https://gerrit.wikimedia.org/g/mediawiki/${type}"]` )
	).map( ( repo ) => repo.href.replace( 'https://gerrit.wikimedia.org/g/', '' ).replace( /\/\+\/.+/, '' ) );
}

/**
 * Returns the name of the repo relative to the `mediawiki` root folder.
 *
 * @param {string} repo
 * @return {string}
 */
function relativeToRoot( repo ) {
	return repo.replace( 'mediawiki/', '' );
}

/**
 * @return {Object.<string, Object>}
 */
function getRepoObj() {
	return [
		'extensions',
		'skins'
	].reduce( ( list, type ) => {
		return list.concat( queryRepos( type ) );
	}, /** @type {string[]} */ ( [] ) )
		.filter( ( repo ) => {
			return !EXCLUDE_MAP[ relativeToRoot( repo ) ];
		} )
		.reduce( ( obj, repo ) => {
			obj[ repo ] = {
				path: relativeToRoot( repo )
			};

			return obj;
		}, /** @type {any} */ ( {} ) );
}

function init() {
	const repoObj = getRepoObj();
	repoObj[ 'mediawiki/core' ] = {
		path: '.'
	};

	// @ts-ignore
	const anchor = document.createElement( 'a' );
	// @ts-ignore
	const file = new Blob( [ JSON.stringify( repoObj, null, 2 ) ], { type: 'application/json' } );

	anchor.href = URL.createObjectURL( file );
	anchor.download = 'repositories';
	anchor.click();
}

init();
