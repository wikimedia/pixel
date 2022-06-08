const Runner = require( './Runner' );
// eslint-disable-next-line node/no-missing-require
const backstop = /** @type {unknown} */ ( require( 'backstopjs' ) );

jest.mock( 'backstopjs', () => {
	return jest.fn( () => Promise.resolve() );
}, {
	virtual: true
} );

/**
 * @param {Object} mergedOpts
 * @return {Runner}
 */
function createRunner( mergedOpts ) {
	return new Runner( {
		type: 'reference',
		config: {},
		reporter: {
			onStart: () => {},
			onEnd: () => {}
		},
		...mergedOpts
	} );
}

describe( 'Runner.js', () => {
	afterEach( () => {
		/** @type {jest.Mock} */ ( backstop ).mockReset();
	} );

	describe( 'when all tests pass', () => {
		it( 'calls reporter onEnd hook', async () => {
			const reporter = {
				onStart: jest.fn(),
				onEnd: jest.fn()
			};
			const runner = createRunner( { reporter } );

			await runner.run();

			expect( reporter.onStart.mock.calls ).toHaveLength( 1 );
			expect( reporter.onEnd.mock.calls ).toHaveLength( 1 );
		} );

	} );

	describe( 'when one or more tests fail', () => {
		it( 'calls reporter onEnd hook', async () => {
			/** @type {jest.Mock} */ ( backstop ).mockImplementationOnce( () => Promise.reject( new Error( 'Mismatch errors found' ) ) );
			const reporter = {
				onStart: jest.fn(),
				onEnd: jest.fn()
			};
			const runner = createRunner( { reporter } );

			await expect( runner.run() ).rejects.toThrow( 'Mismatch errors found' );

			expect( reporter.onStart.mock.calls ).toHaveLength( 1 );
			expect( reporter.onEnd.mock.calls ).toHaveLength( 1 );
		} );
	} );

	describe( 'when an error (other than failed tests) is thrown', () => {
		it( 'does not call reporter onEnd hook', async () => {
			/** @type {jest.Mock} */ ( backstop ).mockImplementationOnce( () => Promise.reject( new Error( 'Some error' ) ) );
			const reporter = {
				onStart: jest.fn(),
				onEnd: jest.fn()
			};
			const runner = createRunner( { reporter } );

			await expect( runner.run() ).rejects.toThrow( 'Some error' );

			expect( reporter.onStart.mock.calls ).toHaveLength( 1 );
			expect( reporter.onEnd.mock.calls ).toHaveLength( 0 );
		} );
	} );
} );
