const BatchSpawn = require( './BatchSpawn' );
const GerritClient = require( './GerritClient' );
const GERRIT_BASE_URL = 'https://gerrit.wikimedia.org/r';

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
 * @typedef {Object.<string, string[]>} PatchCommands
 */

/**
 * Iterates through a given list of MediaWiki repos and performs the following steps:
 *
 * 1) Git fetch from the origin
 * 2) Checks out the desired branch
 * 3) Applies a Gerrit patch, if needed
 * 4) Updates Composer dependencies
 * 5) Executes the maintenance/update.php script in MediaWiki core to perform
 * any database migrations.
 */
class MwCheckout {
	#repos;
	#batchSpawn;
	#gerritClient;

	/**
	 * @param {Repos} repos
	 * @param {BatchSpawn} batchSpawn
	 */
	constructor( repos, batchSpawn ) {
		this.#repos = repos;
		this.#batchSpawn = batchSpawn;
		this.#gerritClient = new GerritClient( GERRIT_BASE_URL );
	}

	/**
	 * @param {string} branch Each repo will be set to this branch. If `master` or
	 * `main` are passed, these will be converted to `origin/master` and
	 * `origin/main`, respectively.
	 * @param {string[]} changeIds An array of Gerrit Change-Ids
	 */
	async checkout( branch, changeIds ) {
		if ( branch === 'master' || branch === 'main' ) {
			branch = `origin/${branch}`;
		}

		// Get list of gerrit patch commands that can be executed later.
		const patchCommands = await this.#getPatchCommands( changeIds, this.#repos, branch );

		await Promise.all( Object.keys( this.#repos ).map( async ( repoId ) => {
			const path = this.#repos[ repoId ].path;
			await this.#fetch( path );
			await this.#checkoutBranch( path, branch, repoId );

			// Apply Gerrit patches, if any.
			// @ts-ignore
			if ( patchCommands[ repoId ] ) {
				for ( const command of patchCommands[ repoId ] ) {
					// Execute patch command.
					await this.#batchSpawn.spawn(
						command,
						[],
						{ shell: true }
					);
				}
			}

			await this.#updateComposer( path );
		} ) );

		// The final step is to run maintenance/update script to perform any
		// database migrations.
		await this.#batchSpawn.spawn(
			'php maintenance/run.php update.php --quick',
			[],
			{ shell: true }
		);
	}

	/**
	 * Performs a Git fetch from the origin.
	 *
	 * @param {string} path
	 */
	async #fetch( path ) {
		await this.#batchSpawn.spawn(
			`
			echo "Git fetch: ${path}"
			git -C "${path}" fetch origin
			`,
			[],
			{ shell: true }
		);
	}

	/**
	 * Checks out a branch in a repo.
	 *
	 * @param {string} path
	 * @param {string} branch
	 * @param {string} repoId
	 */
	async #checkoutBranch( path, branch, repoId ) {
		const { stdout } = await this.#batchSpawn.exec( `git -C "${path}" for-each-ref refs/remotes/origin/ --format='%(refname:short)'` );
		const branches = stdout.split( '\n' );
		// Use the `main` branch instead of `master` if `main` is available and
		// `master` is unavailable.
		branch = branch === 'origin/master' && !branches.includes( 'origin/master' ) && branches.includes( 'origin/main' ) ? 'origin/main' : branch;

		if ( branches.includes( branch ) ) {
			return this.#batchSpawn.spawn(
				`
				echo "Git checkout: ${path}"
				git -C "${path}" checkout -f ${branch}
				`,
				[],
				{ shell: true }
			);
		}

		throw new Error( `Branch "${branch}" of "${repoId}" not found on origin` );
	}

	/**
	 * If a composer.json file is found in a given path, executes either composer
	 * install if a composer.lock file is absent or composer update (if needed)
	 * otherwise.
	 *
	 * @param {string} path
	 */
	async #updateComposer( path ) {
		return this.#batchSpawn.spawn(
			`
			if [ ! -e "${path}/composer.json" ]; then 
				exit
			fi

			if [ ! -e "${path}/composer.lock" ]; then 
				echo "Composer install: ${path}"
				composer install --working-dir="${path}" --no-dev -n -q; 
				exit
			fi

			echo "Composer validate: ${path}"
			composer validate --no-check-all --no-check-publish --no-check-version --quiet
			if [ $? -ne 0 ]; then
				echo "Composer update: ${path}"
				composer update --working-dir="${path}" --no-dev -n -q; 
			fi`,
			[],
			{ shell: true }
		);
	}

	/**
	 * Processes a list of Change-Ids and returns a list of PatchCommands that can
	 * be executed in each relevant repo at a later time.
	 *
	 * Huge kudos to the devs of PatchDemo [1] for figuring out much of what
	 * follows!
	 *
	 * [1] https://github.com/MatmaRex/patchdemo
	 *
	 * @param {string[]} changeQueue
	 * @param {Repos} repos
	 * @param {string} branch rebase the change of a specific branch. If not defined
	 *  uses change branch (master)
	 * @return {Promise<PatchCommands>} patchCommands
	 */
	async #getPatchCommands( changeQueue, repos, branch = '' ) {
		const commands = /** @type {PatchCommands} */ ( {} );

		while ( changeQueue.length ) {
			const changeId = changeQueue.shift();
			const changes = ( await this.#gerritClient.get( `/changes/?q=change:${changeId}&o=LABELS&o=CURRENT_REVISION&o=CURRENT_COMMIT&o=DOWNLOAD_COMMANDS` ) );

			const change = changes[ 0 ];

			if ( changes.length === 0 ) {
				throw new Error( `Change-Id "${changeId}" was not found.` );
			}

			if ( changes.length > 1 ) {
				throw new Error( `Change-Id "${changeId}" returned ${changes.length} results, but only 1 was expected.` );
			}

			if ( !repos[ change.project ] ) {
				console.warn( `WARNING: Project "${change.project}" is not supported.` );
				continue;
			}

			const path = repos[ change.project ].path;

			if ( !change.current_revision ) {
				throw new Error( `Could not find current revision for Change-Id "${changeId}".` );
			}

			commands[ change.project ] = commands[ change.project ] || [];
			branch = branch || `origin/${change.branch}`;
			commands[ change.project ].unshift(
				`
				git -C "${path}" fetch origin ${change.revisions[ change.current_revision ].ref} && 
				{ git -C "${path}"  rebase --onto HEAD ${branch} ${change.current_revision} || {
					e=$?
					rm -fr ${path}/.git/rebase-apply
					exit $e
				} }
				`
			);

			/** @type {{changes: RelatedChange[]}} */
			// eslint-disable-next-line no-underscore-dangle
			const relatedChanges = ( await this.#gerritClient.get( `/changes/${change.id}/revisions/${change.revisions[ change.current_revision ]._number}/related` ) );

			const dependsOnQueue = [
				{
					// eslint-disable-next-line no-underscore-dangle
					changeNumber: change._number,
					// eslint-disable-next-line no-underscore-dangle
					revisionNumber: change.revisions[ change.current_revision ]._number
				}
			];

			let isCommitFound = false;
			relatedChanges.changes.forEach( ( relatedChange ) => {
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
				const commit = await this.#gerritClient.get( `/changes/${item.changeNumber}/revisions/${item.revisionNumber}/commit` );

				const matches = [ ...commit.message.matchAll( /^Depends-On: (.+)$/gm ) ];

				matches.forEach( ( match ) => {
					changeQueue.push( match[ 1 ] );
				} );
			} ) );
		}

		return commands;
	}
}

module.exports = MwCheckout;
