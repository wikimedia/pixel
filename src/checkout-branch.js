const util = require( 'util' );
const exec = util.promisify( require( 'child_process' ).exec );
const spawn = require( 'child_process' ).spawn;

/**
 * @param {string} command
 * @param {string[]} args
 * @param {Object} [opts]
 * @return {Promise<number>}
 */
function createSpawn( command, args, opts = {} ) {
	return new Promise( ( resolve, reject ) => {
		const childProcess = spawn(
			command,
			args,
			{ stdio: 'inherit', ...opts }
		);

		childProcess.on( 'close', ( code ) => {
			if ( code === 0 ) {
				resolve( code );
				return;
			}

			reject( code );
		} );
	} );
}

/**
 * @typedef {Object} RepoDetails
 * @property {string} path
 */

/**
 * @typedef {Object<string, RepoDetails>} Repos
 */

/**
 * @param {string} branch
 * @param {string} path
 * @return {Promise<number>}
 */
function execUpdateCommand( branch, path ) {
	return createSpawn(
		`
		echo "Git checkout: ${path}"
		git -C "${path}" fetch origin
		git -C "${path}" checkout -f ${branch}

		echo "Composer install: ${path}"
		if [ -e "${path}/composer.json" ]; then composer install --working-dir="${path}" --no-dev -n -q; fi;`,
		[],
		{ shell: true }
	);
}

/**
 * @param {string} branch
 * @param {Repos} repos
 */
async function update( branch, repos ) {
	if ( branch === 'master' ) {
		branch = 'origin/master';
	}

	if ( branch === 'main' ) {
		branch = 'origin/main';
	}

	await Promise.all( Object.keys( repos ).map( async ( id ) => {
		const path = repos[ id ].path;
		const childProcess = await exec( `git -C ${path} for-each-ref refs/remotes/origin/ --format='%(refname:short)'` );
		const branches = childProcess.stdout.split( '\n' );

		if ( branches.includes( branch ) ) {
			await execUpdateCommand( branch, path );
			return Promise.resolve();
		}

		if ( branch === 'origin/master' && branches.includes( 'origin/main' ) ) {
			await execUpdateCommand( 'origin/main', path );
			return Promise.resolve();
		}

		console.log( `Branch "${branch}" of "${id}" not found on origin` );
	} ) );

	await createSpawn(
		'php maintenance/update.php --quick',
		[],
		{ shell: true }
	);
}

module.exports = update;
