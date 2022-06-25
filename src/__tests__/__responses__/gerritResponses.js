/* eslint-disable camelcase */

const responses = /** @type {any} */ ( {
	'/changes/?q=change:Iff231a976c473217b0fa4da1aa9a8d1c2a1a19f2&o=LABELS&o=CURRENT_REVISION&o=CURRENT_COMMIT&o=DOWNLOAD_COMMANDS': [
		{
			id: 'mediawiki%2Fskins%2FVector~master~Iff231a976c473217b0fa4da1aa9a8d1c2a1a19f2',
			project: 'mediawiki/skins/Vector',
			branch: 'master',
			topic: 'T302046-split-up',
			attention_set: {},
			hashtags: [],
			change_id: 'Iff231a976c473217b0fa4da1aa9a8d1c2a1a19f2',
			subject: 'Build A/B test bucketing infrastructure for the table of contents.',
			status: 'MERGED',
			created: '2022-03-14 23:09:52.000000000',
			updated: '2022-04-08 15:57:30.000000000',
			submitted: '2022-04-05 17:25:07.000000000',
			submitter: { _account_id: 75 },
			insertions: 381,
			deletions: 26,
			total_comment_count: 75,
			unresolved_comment_count: 4,
			has_review_started: true,
			submission_id: '770625-T302046-split-up',
			meta_rev_id: '67c235b05fea317e5cce1eda5d82baadb6e41406',
			_number: 770625,
			owner: { _account_id: 6176 },
			labels: {
				Verified: { approved: { _account_id: 75 } },
				'Code-Review': { approved: { _account_id: 94 } }
			},
			removable_reviewers: [
				{ _account_id: 94 },
				{ _account_id: 6729 },
				{ _account_id: 75 },
				{ _account_id: 6176 }
			],
			reviewers: {
				REVIEWER: [
					{ _account_id: 75 },
					{ _account_id: 94 },
					{ _account_id: 6176 },
					{ _account_id: 6729 }
				],
				CC: [ { _account_id: 658 } ]
			},
			pending_reviewers: {},
			current_revision: '6fbf08a1986a9dcd78bf4fe2c08df14983d6189f',
			revisions: {
				'6fbf08a1986a9dcd78bf4fe2c08df14983d6189f': {
					kind: 'REWORK',
					_number: 72,
					created: '2022-04-04 23:06:53.000000000',
					uploader: { _account_id: 6176 },
					ref: 'refs/changes/25/770625/72',
					fetch: {
						'anonymous http': {
							url: 'https://gerrit.wikimedia.org/r/mediawiki/skins/Vector',
							ref: 'refs/changes/25/770625/72',
							commands: {
								Branch: 'git fetch https://gerrit.wikimedia.org/r/mediawiki/skins/Vector refs/changes/25/770625/72 && git checkout -b change-770625 FETCH_HEAD',
								Checkout: 'git fetch https://gerrit.wikimedia.org/r/mediawiki/skins/Vector refs/changes/25/770625/72 && git checkout FETCH_HEAD',
								'Cherry Pick': 'git fetch https://gerrit.wikimedia.org/r/mediawiki/skins/Vector refs/changes/25/770625/72 && git cherry-pick FETCH_HEAD',
								'Format Patch': 'git fetch https://gerrit.wikimedia.org/r/mediawiki/skins/Vector refs/changes/25/770625/72 && git format-patch -1 --stdout FETCH_HEAD',
								Pull: 'git pull https://gerrit.wikimedia.org/r/mediawiki/skins/Vector refs/changes/25/770625/72',
								'Reset To': 'git fetch https://gerrit.wikimedia.org/r/mediawiki/skins/Vector refs/changes/25/770625/72 && git reset --hard FETCH_HEAD'
							}
						}
					},
					commit: {
						parents: [
							{
								commit: '19f114281a1f7dff95cb6ec8835e8349152120e1',
								subject: 'Merge "Drop the LatestSkinVersionRequirement"'
							}
						],
						author: {
							name: 'Nicholas Ray',
							email: '',
							date: '2022-03-17 23:02:39.000000000',
							tz: -360
						},
						committer: {
							name: 'Nicholas Ray',
							email: '',
							date: '2022-04-04 23:06:29.000000000',
							tz: -360
						},
						subject: 'Build A/B test bucketing infrastructure for the table of contents.',
						message: 'Build A/B test bucketing infrastructure for the table of contents.\n' +
            '\n' +
            '* Bucket and sample on server by using the\n' +
            '  `WikimediaEvents.WebABTestArticleIdFactory` service from\n' +
            '  WikimediaEvents (soft dependency)\n' +
            '* Add linkHijack.js so that users bucketed in one group have the\n' +
            '  possibility of remaining in that group if they click a link to another\n' +
            '  page.\n' +
            '\n' +
            'Bug: T302046\n' +
            'Depends-On: Ie6627de98effb3d37a3bedda5023d08af319837f\n' +
            'Change-Id: Iff231a976c473217b0fa4da1aa9a8d1c2a1a19f2\n'
					}
				}
			},
			requirements: []
		}
	],
	'/changes/?q=change:Ie6627de98effb3d37a3bedda5023d08af319837f&o=LABELS&o=CURRENT_REVISION&o=CURRENT_COMMIT&o=DOWNLOAD_COMMANDS': [
		{
			id: 'mediawiki%2Fextensions%2FWikimediaEvents~master~Ie6627de98effb3d37a3bedda5023d08af319837f',
			project: 'mediawiki/extensions/WikimediaEvents',
			branch: 'master',
			topic: 'T302046_add-web-ab-test-article-id-strategy',
			attention_set: {},
			hashtags: [],
			change_id: 'Ie6627de98effb3d37a3bedda5023d08af319837f',
			subject: 'Add WebABTestArticleIdFactory and WebABTestArticleIdStrategy classes',
			status: 'MERGED',
			created: '2022-03-30 00:37:12.000000000',
			updated: '2022-04-04 20:58:24.000000000',
			submitted: '2022-04-04 20:57:17.000000000',
			submitter: { _account_id: 75 },
			insertions: 314,
			deletions: 0,
			total_comment_count: 9,
			unresolved_comment_count: 0,
			has_review_started: true,
			submission_id: '774985-T302046_add-web-ab-test-article-id-strategy',
			meta_rev_id: '218745c2361522c1822c7493c200a828c6f8c8ef',
			_number: 774985,
			owner: { _account_id: 6176 },
			labels: {
				Verified: { approved: { _account_id: 75 } },
				'Code-Review': { approved: { _account_id: 94 } }
			},
			removable_reviewers: [
				{ _account_id: 94 },
				{ _account_id: 75 },
				{ _account_id: 6176 },
				{ _account_id: 34 }
			],
			reviewers: {
				REVIEWER: [
					{ _account_id: 34 },
					{ _account_id: 75 },
					{ _account_id: 94 },
					{ _account_id: 6176 }
				],
				CC: [ { _account_id: 6729 } ]
			},
			pending_reviewers: {},
			current_revision: 'd4fe44201418d19e832d73b5e63907fdec4cf3d3',
			revisions: {
				d4fe44201418d19e832d73b5e63907fdec4cf3d3: {
					kind: 'REWORK',
					_number: 10,
					created: '2022-03-31 21:38:50.000000000',
					uploader: { _account_id: 6176 },
					ref: 'refs/changes/85/774985/10',
					fetch: {
						'anonymous http': {
							url: 'https://gerrit.wikimedia.org/r/mediawiki/extensions/WikimediaEvents',
							ref: 'refs/changes/85/774985/10',
							commands: {
								Branch: 'git fetch https://gerrit.wikimedia.org/r/mediawiki/extensions/WikimediaEvents refs/changes/85/774985/10 && git checkout -b change-774985 FETCH_HEAD',
								Checkout: 'git fetch https://gerrit.wikimedia.org/r/mediawiki/extensions/WikimediaEvents refs/changes/85/774985/10 && git checkout FETCH_HEAD',
								'Cherry Pick': 'git fetch https://gerrit.wikimedia.org/r/mediawiki/extensions/WikimediaEvents refs/changes/85/774985/10 && git cherry-pick FETCH_HEAD',
								'Format Patch': 'git fetch https://gerrit.wikimedia.org/r/mediawiki/extensions/WikimediaEvents refs/changes/85/774985/10 && git format-patch -1 --stdout FETCH_HEAD',
								Pull: 'git pull https://gerrit.wikimedia.org/r/mediawiki/extensions/WikimediaEvents refs/changes/85/774985/10',
								'Reset To': 'git fetch https://gerrit.wikimedia.org/r/mediawiki/extensions/WikimediaEvents refs/changes/85/774985/10 && git reset --hard FETCH_HEAD'
							}
						}
					},
					commit: {
						parents: [
							{
								commit: '0d8f004d408af2cd5f482fb043ad554e2fe61cd8',
								subject: 'Merge "Update webUIScroll js to process new hook."'
							}
						],
						author: {
							name: 'Nicholas Ray',
							email: '',
							date: '2022-03-29 23:09:02.000000000',
							tz: -360
						},
						committer: {
							name: 'Nicholas Ray',
							email: '',
							date: '2022-03-31 21:38:43.000000000',
							tz: -360
						},
						subject: 'Add WebABTestArticleIdFactory and WebABTestArticleIdStrategy classes',
						message: 'Add WebABTestArticleIdFactory and WebABTestArticleIdStrategy classes\n' +
            '\n' +
            "Their immediate use cases will be for Vector's AB test of the table of\n" +
            'contents which relies on the article id for bucketing.\n' +
            '\n' +
            'Bug: T302046\n' +
            'Change-Id: Ie6627de98effb3d37a3bedda5023d08af319837f\n'
					}
				}
			},
			requirements: []
		}
	],
	'/changes/mediawiki%2Fskins%2FVector~master~Iff231a976c473217b0fa4da1aa9a8d1c2a1a19f2/revisions/72/related': { changes: [] },
	'/changes/770625/revisions/72/commit': {
		commit: '6fbf08a1986a9dcd78bf4fe2c08df14983d6189f',
		parents: [
			{
				commit: '19f114281a1f7dff95cb6ec8835e8349152120e1',
				subject: 'Merge "Drop the LatestSkinVersionRequirement"'
			}
		],
		author: {
			name: 'Nicholas Ray',
			email: '',
			date: '2022-03-17 23:02:39.000000000',
			tz: -360
		},
		committer: {
			name: 'Nicholas Ray',
			email: '',
			date: '2022-04-04 23:06:29.000000000',
			tz: -360
		},
		subject: 'Build A/B test bucketing infrastructure for the table of contents.',
		message: 'Build A/B test bucketing infrastructure for the table of contents.\n' +
    '\n' +
    '* Bucket and sample on server by using the\n' +
    '  `WikimediaEvents.WebABTestArticleIdFactory` service from\n' +
    '  WikimediaEvents (soft dependency)\n' +
    '* Add linkHijack.js so that users bucketed in one group have the\n' +
    '  possibility of remaining in that group if they click a link to another\n' +
    '  page.\n' +
    '\n' +
    'Bug: T302046\n' +
    'Depends-On: Ie6627de98effb3d37a3bedda5023d08af319837f\n' +
    'Change-Id: Iff231a976c473217b0fa4da1aa9a8d1c2a1a19f2\n'
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
