#!/usr/bin/env node
const client = require('axios').default;
const util = require('util');
const exec = util.promisify(require("child_process").exec);

async function getGerrit(path) {
	console.log(`https://gerrit.wikimedia.org/r/${path}` );
	const res = await client.get(`https://gerrit.wikimedia.org/r/${path}`);

	return JSON.parse(res.data.substring(4));
}

function getPath(change) {
	return repos[change['project']]['path'];
}

async function processQueue( changeQueue, repos ) {
	const commands = [];

	while ( changeQueue.length ) {
		const changeId = changeQueue.shift();
		const changes = (await getGerrit( `changes/?q=change:${changeId}&o=LABELS&o=CURRENT_REVISION&o=CURRENT_COMMIT&o=DOWNLOAD_COMMANDS` ))
		const change = changes[0];

		if ( changes.length === 0  ) {
			throw new Error( `Change-Id "${change['project']}'" was not found.` );
		}

		if ( changes.length > 1  ) {
			throw new Error( `Change-Id "${changeId}'" returned ${changes.length} results, but only one was expected.` );
		}

		if ( !repos[change['project']] ) {
			throw new Error( `Project "${change['project']}" is not supported.` );
		}

		const path = getPath(change);

		if (!change['current_revision']) {
			throw new Error( `Could not find current revision for Change-Id "${changeId}".` );
		}

		commands.push( 
			`cd ${path} && 
			git fetch origin ${change['revisions'][change['current_revision']]['ref']} && 
			git rebase --onto HEAD origin/${change.branch} ${change['current_revision']}`
		);

		/** @type {array} */
		const relatedChanges = (await getGerrit( `changes/${change.id}/revisions/${change['revisions'][change['current_revision']]['_number']}/related`))['changes'];

		const dependsOnQueue = [
			{
				changeNumber: change['_number'],
				revisionNumber: change['revisions'][change['current_revision']]['_number']
			}
		];

		let isCommitFound = false;
		relatedChanges.forEach( relatedChange => {
			if (isCommitFound) {
				dependsOnQueue.push({
					changeNumber: relatedChange['_change_number'],
					revisionNumber: relatedChange['_revision_number']
				})
				return;
			}

			if (relatedChange['commit']['commit'] === change['current_revision']) {
				isCommitFound = true;
			}
		});

		await dependsOnQueue.reduce( async (memo, item) => {
			const commit = await getGerrit( `changes/${item.changeNumber}/revisions/${item.revisionNumber}/commit`, true );
			let matches = [...commit.message.matchAll(/^Depends-On: (.+)$/gm)]

			matches.forEach( match => {
				changeQueue.push( match[1] );
			} );
		}, undefined );
	}

	await commands.reduce( async (memo, command) => {
		await exec( command );
	}, undefined );
}

module.exports = processQueue;
