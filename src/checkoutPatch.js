const util = require( 'util' );
const exec = util.promisify( require( 'child_process' ).exec );
const https = require( 'https' );

const client = {
	/**
	 * @param {string} url
	 * @return {Promise<string>}
	 */
	get: ( url ) => {
		let data = '';
		return new Promise( ( resolve, reject ) => {
			https.get( url, ( res ) => {
				res.setEncoding( 'utf8' );

				res.on( 'data', ( chunk ) => {
					data += chunk;
				} );

				res.on( 'end', () => {
					resolve( data );
				} );

				res.on( 'error', ( e ) => {
					console.error( e );
					reject( e );
				} );
			} );
		} );
	}
};

/**
 * @typedef {Object} Commit
 * @property {string} commit
 */

/**
 * @typedef {Object} RelatedChange
 * @property {Commit} commit
 * @property {number} _change_number
 * @property {number} _revision_number
 */

/**
 * @typedef {Object} Change
 * @property {string} project
 */

/**
 * @typedef {Object} RepoDetails
 * @property {string} path
 */

/**
 * @typedef {Object<string, RepoDetails>} Repos
 */

/**
 * @param {string} path
 */
async function getGerrit( path ) {
	console.log( `https://gerrit.wikimedia.org/r/${path}` );
	const res = await client.get( `https://gerrit.wikimedia.org/r/${path}` );

	return JSON.parse( res.slice( 4 ) );
}

/**
 * @param {Change} change
 * @param {Repos} repos
 * @return {string}
 */
function getPath( change, repos ) {
	return repos[ change.project ].path;
}

/**
 * Processes a list of Change-Ids and checks out the appropriate patches. Kudos
 * to the devs of PatchDemo [1] for figuring out much of what follows.
 *
 * [1] https://github.com/MatmaRex/patchdemo
 *
 * @param {string[]} changeQueue
 * @param {Repos} repos
 */
async function processQueue( changeQueue, repos ) {
	const commands = [];

	while ( changeQueue.length ) {
		const changeId = changeQueue.shift();
		const changes = ( await getGerrit( `changes/?q=change:${changeId}&o=LABELS&o=CURRENT_REVISION&o=CURRENT_COMMIT&o=DOWNLOAD_COMMANDS` ) );
		const change = changes[ 0 ];

		if ( changes.length === 0 ) {
			throw new Error( `Change-Id "${change.project}'" was not found.` );
		}

		if ( changes.length > 1 ) {
			throw new Error( `Change-Id "${changeId}'" returned ${changes.length} results, but only one was expected.` );
		}

		if ( !repos[ change.project ] ) {
			throw new Error( `Project "${change.project}" is not supported.` );
		}

		const path = getPath( change, repos );

		if ( !change.current_revision ) {
			throw new Error( `Could not find current revision for Change-Id "${changeId}".` );
		}

		commands.push(
			`cd ${path} && 
			git fetch origin ${change.revisions[ change.current_revision ].ref} && 
			git rebase --onto HEAD origin/${change.branch} ${change.current_revision}`
		);

		/** @type {RelatedChange[]} */
		// eslint-disable-next-line no-underscore-dangle
		const relatedChanges = ( await getGerrit( `changes/${change.id}/revisions/${change.revisions[ change.current_revision ]._number}/related` ) ).changes;

		const dependsOnQueue = [
			{
				// eslint-disable-next-line no-underscore-dangle
				changeNumber: change._number,
				// eslint-disable-next-line no-underscore-dangle
				revisionNumber: change.revisions[ change.current_revision ]._number
			}
		];

		let isCommitFound = false;
		relatedChanges.forEach( ( relatedChange ) => {
			if ( isCommitFound ) {
				dependsOnQueue.push( {
					// eslint-disable-next-line no-underscore-dangle
					changeNumber: relatedChange._change_number,
					// eslint-disable-next-line no-underscore-dangle
					revisionNumber: relatedChange._revision_number
				} );
				return;
			}

			if ( relatedChange.commit.commit === change.current_revision ) {
				isCommitFound = true;
			}
		} );

		await Promise.all( dependsOnQueue.map( async ( item ) => {
			const commit = await getGerrit( `changes/${item.changeNumber}/revisions/${item.revisionNumber}/commit` );
			const matches = [ ...commit.message.matchAll( /^Depends-On: (.+)$/gm ) ];

			matches.forEach( ( match ) => {
				changeQueue.push( match[ 1 ] );
			} );
		} ) );
	}

	await Promise.all( commands.map( async ( command ) => {
		await exec( command );
	} ) );
}

module.exports = processQueue;
