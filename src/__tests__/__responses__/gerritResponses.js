/* eslint-disable camelcase */

// The only purpose of this file is to provide stubbed responses from Gerrit for
// unit testing MwCheckout.

const responses = /** @type {any} */ ( {
	'/changes/?q=change:I8d3af86fdc3daf42441a93fc5b64ebcef37c5fb4&o=LABELS&o=CURRENT_REVISION&o=CURRENT_COMMIT&o=DOWNLOAD_COMMANDS': [
		{
			id: 'mediawiki%2Fskins%2FVector~master~I8d3af86fdc3daf42441a93fc5b64ebcef37c5fb4',
			project: 'mediawiki/skins/Vector',
			branch: 'master',
			topic: 'patch-C',
			hashtags: [],
			change_id: 'I8d3af86fdc3daf42441a93fc5b64ebcef37c5fb4',
			subject: 'Patch C',
			status: 'ABANDONED',
			created: '2022-06-27 18:59:04.000000000',
			updated: '2022-06-27 19:05:01.000000000',
			insertions: 1,
			deletions: 1,
			total_comment_count: 0,
			unresolved_comment_count: 0,
			has_review_started: true,
			meta_rev_id: 'bd0a02fac6d854e820432511db24234d4d5296ef',
			_number: 808994,
			owner: { _account_id: 6176 },
			labels: { Verified: {}, 'Code-Review': {} },
			removable_reviewers: [],
			reviewers: {},
			pending_reviewers: {},
			current_revision: 'd3f8da35b1ec7b0b922e7fcff32e82b4c5e1261c',
			revisions: {
				d3f8da35b1ec7b0b922e7fcff32e82b4c5e1261c: {
					kind: 'NO_CODE_CHANGE',
					_number: 2,
					created: '2022-06-27 19:04:56.000000000',
					uploader: { _account_id: 6176 },
					ref: 'refs/changes/94/808994/2',
					fetch: {
						'anonymous http': {
							url: 'https://gerrit.wikimedia.org/r/mediawiki/skins/Vector',
							ref: 'refs/changes/94/808994/2',
							commands: {
								Branch: 'git fetch https://gerrit.wikimedia.org/r/mediawiki/skins/Vector refs/changes/94/808994/2 && git checkout -b change-808994 FETCH_HEAD',
								Checkout: 'git fetch https://gerrit.wikimedia.org/r/mediawiki/skins/Vector refs/changes/94/808994/2 && git checkout FETCH_HEAD',
								'Cherry Pick': 'git fetch https://gerrit.wikimedia.org/r/mediawiki/skins/Vector refs/changes/94/808994/2 && git cherry-pick FETCH_HEAD',
								'Format Patch': 'git fetch https://gerrit.wikimedia.org/r/mediawiki/skins/Vector refs/changes/94/808994/2 && git format-patch -1 --stdout FETCH_HEAD',
								Pull: 'git pull https://gerrit.wikimedia.org/r/mediawiki/skins/Vector refs/changes/94/808994/2',
								'Reset To': 'git fetch https://gerrit.wikimedia.org/r/mediawiki/skins/Vector refs/changes/94/808994/2 && git reset --hard FETCH_HEAD'
							}
						}
					},
					commit: {
						parents: [
							{
								commit: '7277e5c134007443f8d845ac431171f43db4ee6a',
								subject: 'Patch A'
							}
						],
						author: {
							name: 'Nicholas Ray',
							email: 'email@email.com',
							date: '2022-06-27 18:58:23.000000000',
							tz: -360
						},
						committer: {
							name: 'Nicholas Ray',
							email: 'email@email.com',
							date: '2022-06-27 19:04:09.000000000',
							tz: -360
						},
						subject: 'Patch C',
						message: 'Patch C\n' +
            '\n' +
            'DNM. Testing how Pixel handles dependencies.\n' +
            '\n' +
            'Depends-On: Ib47c2b6bf5a15e1eddc8c39f5e401da45a4fd4d9\n' +
            'Change-Id: I8d3af86fdc3daf42441a93fc5b64ebcef37c5fb4\n'
					}
				}
			},
			requirements: []
		}
	],
	'/changes/?q=change:Ib47c2b6bf5a15e1eddc8c39f5e401da45a4fd4d9&o=LABELS&o=CURRENT_REVISION&o=CURRENT_COMMIT&o=DOWNLOAD_COMMANDS': [
		{
			id: 'mediawiki%2Fcore~master~Ib47c2b6bf5a15e1eddc8c39f5e401da45a4fd4d9',
			project: 'mediawiki/core',
			branch: 'master',
			topic: 'patch-B',
			hashtags: [],
			change_id: 'Ib47c2b6bf5a15e1eddc8c39f5e401da45a4fd4d9',
			subject: 'Patch B',
			status: 'ABANDONED',
			created: '2022-06-27 18:55:05.000000000',
			updated: '2022-06-27 18:55:46.000000000',
			insertions: 1,
			deletions: 0,
			total_comment_count: 0,
			unresolved_comment_count: 0,
			has_review_started: true,
			meta_rev_id: 'ad2941d3197a9c399ade18b5fa0abd614517eb4a',
			_number: 808992,
			owner: { _account_id: 6176 },
			labels: { Verified: {}, 'Code-Review': {} },
			removable_reviewers: [],
			reviewers: {},
			pending_reviewers: {},
			current_revision: 'deb376ac25caf69489dc86d2130ef48eccf135f6',
			revisions: {
				deb376ac25caf69489dc86d2130ef48eccf135f6: {
					kind: 'NO_CODE_CHANGE',
					_number: 2,
					created: '2022-06-27 18:55:29.000000000',
					uploader: { _account_id: 6176 },
					ref: 'refs/changes/92/808992/2',
					fetch: {
						'anonymous http': {
							url: 'https://gerrit.wikimedia.org/r/mediawiki/core',
							ref: 'refs/changes/92/808992/2',
							commands: {
								Branch: 'git fetch https://gerrit.wikimedia.org/r/mediawiki/core refs/changes/92/808992/2 && git checkout -b change-808992 FETCH_HEAD',
								Checkout: 'git fetch https://gerrit.wikimedia.org/r/mediawiki/core refs/changes/92/808992/2 && git checkout FETCH_HEAD',
								'Cherry Pick': 'git fetch https://gerrit.wikimedia.org/r/mediawiki/core refs/changes/92/808992/2 && git cherry-pick FETCH_HEAD',
								'Format Patch': 'git fetch https://gerrit.wikimedia.org/r/mediawiki/core refs/changes/92/808992/2 && git format-patch -1 --stdout FETCH_HEAD',
								Pull: 'git pull https://gerrit.wikimedia.org/r/mediawiki/core refs/changes/92/808992/2',
								'Reset To': 'git fetch https://gerrit.wikimedia.org/r/mediawiki/core refs/changes/92/808992/2 && git reset --hard FETCH_HEAD'
							}
						}
					},
					commit: {
						parents: [
							{
								commit: '65dee0142655e33209e6458348649bdfb56496b4',
								subject: 'ParserCache: ensure we know a revision ID'
							}
						],
						author: {
							name: 'Nicholas Ray',
							email: 'email@email.com',
							date: '2022-06-27 18:54:46.000000000',
							tz: -360
						},
						committer: {
							name: 'Nicholas Ray',
							email: 'email@email.com',
							date: '2022-06-27 18:55:11.000000000',
							tz: -360
						},
						subject: 'Patch B',
						message: 'Patch B\n' +
							'\n' +
							'DNM. Testing how Pixel handles dependencies.\n' +
							'\n' +
							'Depends-On: Iea9eb11b95e48c09cccf69ddcce33cdcece99083\n' +
							'Change-Id: Ib47c2b6bf5a15e1eddc8c39f5e401da45a4fd4d9\n'
					}
				}
			},
			requirements: []
		}
	],
	'/changes/?q=change:Iea9eb11b95e48c09cccf69ddcce33cdcece99083&o=LABELS&o=CURRENT_REVISION&o=CURRENT_COMMIT&o=DOWNLOAD_COMMANDS': [
		{
			id: 'mediawiki%2Fskins%2FVector~master~Iea9eb11b95e48c09cccf69ddcce33cdcece99083',
			project: 'mediawiki/skins/Vector',
			branch: 'master',
			topic: 'patch-A',
			hashtags: [],
			change_id: 'Iea9eb11b95e48c09cccf69ddcce33cdcece99083',
			subject: 'Patch A',
			status: 'ABANDONED',
			created: '2022-06-27 18:50:17.000000000',
			updated: '2022-06-27 18:50:36.000000000',
			insertions: 1,
			deletions: 0,
			total_comment_count: 0,
			unresolved_comment_count: 0,
			has_review_started: true,
			meta_rev_id: 'bd27d03c2d01df73380df94fa4c55d08ba7bc389',
			_number: 808991,
			owner: { _account_id: 6176 },
			labels: { Verified: {}, 'Code-Review': {} },
			removable_reviewers: [],
			reviewers: {},
			pending_reviewers: {},
			current_revision: '7277e5c134007443f8d845ac431171f43db4ee6a',
			revisions: {
				'7277e5c134007443f8d845ac431171f43db4ee6a': {
					kind: 'REWORK',
					_number: 1,
					created: '2022-06-27 18:50:17.000000000',
					uploader: { _account_id: 6176 },
					ref: 'refs/changes/91/808991/1',
					fetch: {
						'anonymous http': {
							url: 'https://gerrit.wikimedia.org/r/mediawiki/skins/Vector',
							ref: 'refs/changes/91/808991/1',
							commands: {
								Branch: 'git fetch https://gerrit.wikimedia.org/r/mediawiki/skins/Vector refs/changes/91/808991/1 && git checkout -b change-808991 FETCH_HEAD',
								Checkout: 'git fetch https://gerrit.wikimedia.org/r/mediawiki/skins/Vector refs/changes/91/808991/1 && git checkout FETCH_HEAD',
								'Cherry Pick': 'git fetch https://gerrit.wikimedia.org/r/mediawiki/skins/Vector refs/changes/91/808991/1 && git cherry-pick FETCH_HEAD',
								'Format Patch': 'git fetch https://gerrit.wikimedia.org/r/mediawiki/skins/Vector refs/changes/91/808991/1 && git format-patch -1 --stdout FETCH_HEAD',
								Pull: 'git pull https://gerrit.wikimedia.org/r/mediawiki/skins/Vector refs/changes/91/808991/1',
								'Reset To': 'git fetch https://gerrit.wikimedia.org/r/mediawiki/skins/Vector refs/changes/91/808991/1 && git reset --hard FETCH_HEAD'
							}
						}
					},
					commit: {
						parents: [
							{
								commit: 'a34b56419293077e47ee08aa1dba39d2d2694766',
								subject: 'Merge "Layout: Don\'t hide footer < 1000px when sidebar closed"'
							}
						],
						author: {
							name: 'Nicholas Ray',
							email: 'email@email.com',
							date: '2022-06-27 18:49:00.000000000',
							tz: -360
						},
						committer: {
							name: 'Nicholas Ray',
							email: 'email@email.com',
							date: '2022-06-27 18:49:00.000000000',
							tz: -360
						},
						subject: 'Patch A',
						message: 'Patch A\n' +
            '\n' +
            'DNM. Testing how pixel handles patches with dependencies.\n' +
            '\n' +
            'Change-Id: Iea9eb11b95e48c09cccf69ddcce33cdcece99083\n'
					}
				}
			},
			requirements: []
		}
	],
	'/changes/mediawiki%2Fskins%2FVector~master~I8d3af86fdc3daf42441a93fc5b64ebcef37c5fb4/revisions/2/related': {
		changes: [
			{
				project: 'mediawiki/skins/Vector',
				change_id: 'I8d3af86fdc3daf42441a93fc5b64ebcef37c5fb4',
				commit: {
					commit: 'd3f8da35b1ec7b0b922e7fcff32e82b4c5e1261c',
					parents: [ { commit: '7277e5c134007443f8d845ac431171f43db4ee6a' } ],
					author: {
						name: 'Nicholas Ray',
						email: 'email@email.com',
						date: '2022-06-27 18:58:23.000000000',
						tz: -360
					},
					subject: 'Patch C'
				},
				_change_number: 808994,
				_revision_number: 2,
				_current_revision_number: 2,
				status: 'ABANDONED'
			},
			{
				project: 'mediawiki/skins/Vector',
				change_id: 'Iea9eb11b95e48c09cccf69ddcce33cdcece99083',
				commit: {
					commit: '7277e5c134007443f8d845ac431171f43db4ee6a',
					parents: [ { commit: 'a34b56419293077e47ee08aa1dba39d2d2694766' } ],
					author: {
						name: 'Nicholas Ray',
						email: 'email@email.com',
						date: '2022-06-27 18:49:00.000000000',
						tz: -360
					},
					subject: 'Patch A'
				},
				_change_number: 808991,
				_revision_number: 1,
				_current_revision_number: 1,
				status: 'ABANDONED'
			}
		]
	},
	'/changes/mediawiki%2Fcore~master~Ib47c2b6bf5a15e1eddc8c39f5e401da45a4fd4d9/revisions/2/related': {
		changes: []
	},
	'/changes/mediawiki%2Fskins%2FVector~master~Iea9eb11b95e48c09cccf69ddcce33cdcece99083/revisions/1/related': {
		changes: [
			{
				project: 'mediawiki/skins/Vector',
				change_id: 'I8d3af86fdc3daf42441a93fc5b64ebcef37c5fb4',
				commit: {
					commit: 'd3f8da35b1ec7b0b922e7fcff32e82b4c5e1261c',
					parents: [ { commit: '7277e5c134007443f8d845ac431171f43db4ee6a' } ],
					author: {
						name: 'Nicholas Ray',
						email: 'email@email.com',
						date: '2022-06-27 18:58:23.000000000',
						tz: -360
					},
					subject: 'Patch C'
				},
				_change_number: 808994,
				_revision_number: 2,
				_current_revision_number: 2,
				status: 'ABANDONED'
			},
			{
				project: 'mediawiki/skins/Vector',
				change_id: 'Iea9eb11b95e48c09cccf69ddcce33cdcece99083',
				commit: {
					commit: '7277e5c134007443f8d845ac431171f43db4ee6a',
					parents: [ { commit: 'a34b56419293077e47ee08aa1dba39d2d2694766' } ],
					author: {
						name: 'Nicholas Ray',
						email: 'email@email.com',
						date: '2022-06-27 18:49:00.000000000',
						tz: -360
					},
					subject: 'Patch A'
				},
				_change_number: 808991,
				_revision_number: 1,
				_current_revision_number: 1,
				status: 'ABANDONED'
			}
		]
	},
	'/changes/808994/revisions/2/commit': {
		commit: 'd3f8da35b1ec7b0b922e7fcff32e82b4c5e1261c',
		parents: [
			{
				commit: '7277e5c134007443f8d845ac431171f43db4ee6a',
				subject: 'Patch A'
			}
		],
		author: {
			name: 'Nicholas Ray',
			email: 'email@email.com',
			date: '2022-06-27 18:58:23.000000000',
			tz: -360
		},
		committer: {
			name: 'Nicholas Ray',
			email: 'email@email.com',
			date: '2022-06-27 19:04:09.000000000',
			tz: -360
		},
		subject: 'Patch C',
		message: 'Patch C\n' +
    '\n' +
    'DNM. Testing how Pixel handles dependencies.\n' +
    '\n' +
    'Depends-On: Ib47c2b6bf5a15e1eddc8c39f5e401da45a4fd4d9\n' +
    'Change-Id: I8d3af86fdc3daf42441a93fc5b64ebcef37c5fb4\n'
	},
	'/changes/808991/revisions/1/commit': {
		commit: '7277e5c134007443f8d845ac431171f43db4ee6a',
		parents: [
			{
				commit: 'a34b56419293077e47ee08aa1dba39d2d2694766',
				subject: 'Merge "Layout: Don\'t hide footer < 1000px when sidebar closed"'
			}
		],
		author: {
			name: 'Nicholas Ray',
			email: 'email@email.com',
			date: '2022-06-27 18:49:00.000000000',
			tz: -360
		},
		committer: {
			name: 'Nicholas Ray',
			email: 'email@email.com',
			date: '2022-06-27 18:49:00.000000000',
			tz: -360
		},
		subject: 'Patch A',
		message: 'Patch A\n' +
    '\n' +
    'DNM. Testing how pixel handles patches with dependencies.\n' +
    '\n' +
    'Change-Id: Iea9eb11b95e48c09cccf69ddcce33cdcece99083\n'
	},
	'/changes/808992/revisions/2/commit': {
		commit: 'deb376ac25caf69489dc86d2130ef48eccf135f6',
		parents: [
			{
				commit: '65dee0142655e33209e6458348649bdfb56496b4',
				subject: 'ParserCache: ensure we know a revision ID'
			}
		],
		author: {
			name: 'Nicholas Ray',
			email: 'email@email.com',
			date: '2022-06-27 18:54:46.000000000',
			tz: -360
		},
		committer: {
			name: 'Nicholas Ray',
			email: 'email@email.com',
			date: '2022-06-27 18:55:11.000000000',
			tz: -360
		},
		subject: 'Patch B',
		message: 'Patch B\n' +
    '\n' +
    'DNM. Testing how Pixel handles dependencies.\n' +
    '\n' +
    'Depends-On: Iea9eb11b95e48c09cccf69ddcce33cdcece99083\n' +
    'Change-Id: Ib47c2b6bf5a15e1eddc8c39f5e401da45a4fd4d9\n'
	}
} );

/**
 * @param {string} path
 * @return {any}
 */
module.exports = ( path ) => {
	if ( !responses[ path ] ) {
		throw new Error( `Could not find a stubbed response for ${path} in ${__dirname}. Has it been added?` );
	}

	return responses[ path ];
};
