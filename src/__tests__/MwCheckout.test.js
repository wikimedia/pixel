const GerritClient = require( '../GerritClient' );
const BatchSpawn = require( '../BatchSpawn' );
const MwCheckout = require( '../MwCheckout' );
const gerritResponses = require( './__responses__/gerritResponses' );
jest.mock( '../GerritClient' );
jest.mock( '../BatchSpawn' );

function create() {
	const batchSpawn = new BatchSpawn( 1 );
	const mwCheckout = new MwCheckout( {
		'mediawiki/skins/Vector': {
			path: 'skins/Vector'
		},
		'mediawiki/core': {
			path: '.'
		}
	}, batchSpawn );
	// @ts-ignore
	const gerritClient = GerritClient.mock.instances[ 0 ];
	gerritClient.get.mockImplementation( async ( /** @type {string} */ path ) => {
		return gerritResponses( path );
	} );

	// @ts-ignore
	batchSpawn.exec.mockImplementation( async () => {
		return {
			stdout: 'origin/master'
		};
	} );

	return {
		batchSpawn,
		mwCheckout,
		gerritClient
	};
}

describe( 'MwCheckout.js', () => {
	afterEach( () => {
		// @ts-ignore
		GerritClient.mockClear();
		// @ts-ignore
		BatchSpawn.mockClear();
	} );

	describe( 'checkout', () => {
		it( 'calls the maintenance/update.php script at the end', async () => {
			const factory = create();

			await factory.mwCheckout.checkout( 'master', [ 'I8d3af86fdc3daf42441a93fc5b64ebcef37c5fb4' ] );

			expect( factory.batchSpawn.spawn ).toHaveBeenLastCalledWith( 'php maintenance/run.php update.php --quick', expect.anything(), expect.anything() );
		} );

		it( 'throws an error when branch is not found', async () => {
			const factory = create();

			await expect( factory.mwCheckout.checkout( 'branch-that-doesnt-exist', [ 'I8d3af86fdc3daf42441a93fc5b64ebcef37c5fb4' ] ) )
				.rejects.toThrow( 'not found on origin' );

		} );

		it( 'throws an error when gerrit returns more than one change', async () => {
			const factory = create();

			factory.gerritClient.get.mockImplementation( async ( /** @type {string} */ path ) => {
				return path === '/changes/?q=change:I8d3af86fdc3daf42441a93fc5b64ebcef37c5fb4&o=LABELS&o=CURRENT_REVISION&o=CURRENT_COMMIT&o=DOWNLOAD_COMMANDS' ? [ {}, {} ] : gerritResponses( path );
			} );

			await expect( factory.mwCheckout.checkout( 'master', [ 'I8d3af86fdc3daf42441a93fc5b64ebcef37c5fb4' ] ) )
				.rejects.toThrow( 'returned 2 results, but only 1 was expected' );
		} );

		it( 'throws an error when gerrit returns a change without a revision', async () => {
			const factory = create();

			factory.gerritClient.get.mockImplementation( async ( /** @type {string} */ path ) => {
				return path === '/changes/?q=change:I8d3af86fdc3daf42441a93fc5b64ebcef37c5fb4&o=LABELS&o=CURRENT_REVISION&o=CURRENT_COMMIT&o=DOWNLOAD_COMMANDS' ?
					// eslint-disable-next-line camelcase
					[ { current_revision: null, project: 'mediawiki/core' } ] : gerritResponses( path );
			} );

			await expect( factory.mwCheckout.checkout( 'master', [ 'I8d3af86fdc3daf42441a93fc5b64ebcef37c5fb4' ] ) )
				.rejects.toThrow( 'Could not find current revision' );
		} );

		it( 'throws an error when change-id is not found', async () => {
			const factory = create();

			factory.gerritClient.get.mockImplementation( async ( /** @type {string} */ path ) => {
				return path === '/changes/?q=change:I8d3af86fdc3daf42441a93fc5b64ebcef37c5fb4&o=LABELS&o=CURRENT_REVISION&o=CURRENT_COMMIT&o=DOWNLOAD_COMMANDS' ? [] : gerritResponses( path );
			} );

			await expect( factory.mwCheckout.checkout( 'master', [ 'I8d3af86fdc3daf42441a93fc5b64ebcef37c5fb4' ] ) )
				.rejects.toThrow( 'was not found' );
		} );
	} );

} );
