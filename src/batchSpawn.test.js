const BatchSpawn = require( './BatchSpawn' );
const childProcess = require( 'child_process' );

jest.mock( 'child_process', () => {
	return {
		...jest.requireActual( 'child_process' ),
		spawn: jest.fn()
	};
} );

describe( 'BatchSpawn.js', () => {
	afterEach( () => {
		/** @type {jest.Mock} */ ( childProcess.spawn ).mockReset();
	} );

	describe( 'when initialized with default params', () => {
		it( 'executes commands sequentially', () => {
			const cp1 = new childProcess.ChildProcess();
			const cp2 = new childProcess.ChildProcess();
			const spawn = /** @type {jest.Mock} */ ( childProcess.spawn );
			const spawnSpy = spawn
				.mockImplementationOnce( () => cp1 )
				.mockImplementationOnce( () => cp2 );

			const batchSpawn = new BatchSpawn();
			batchSpawn.spawn( 'ls', [ 'one' ] );
			batchSpawn.spawn( 'ls', [ 'two' ] );

			expect( spawnSpy ).toHaveBeenNthCalledWith( 1, 'ls', [ 'one' ], { stdio: 'inherit' } );
			expect( spawnSpy ).toHaveBeenCalledTimes( 1 );

			cp1.emit( 'exit', 0 );
			expect( spawnSpy ).toHaveBeenNthCalledWith( 2, 'ls', [ 'two' ], { stdio: 'inherit' } );
			expect( spawnSpy ).toHaveBeenCalledTimes( 2 );

			cp2.emit( 'exit', 0 );
			expect( spawnSpy ).toHaveBeenCalledTimes( 2 );
		} );
	} );

	describe( 'when called with a batchSize greater than one', () => {
		it( 'the number of commands it executes in parallel does not exceed the batch size limit', async () => {
			const cp1 = new childProcess.ChildProcess();
			const cp2 = new childProcess.ChildProcess();
			const cp3 = new childProcess.ChildProcess();
			const cp4 = new childProcess.ChildProcess();
			const cp5 = new childProcess.ChildProcess();
			const spawnSpy = /** @type {jest.Mock} */ ( childProcess.spawn )
				.mockImplementationOnce( () => cp1 )
				.mockImplementationOnce( () => cp2 )
				.mockImplementationOnce( () => cp3 )
				.mockImplementationOnce( () => cp4 )
				.mockImplementationOnce( () => cp5 );

			const batchSpawn = new BatchSpawn( 2 );
			batchSpawn.spawn( 'ls', [ 'one' ], { } );
			const bs2 = batchSpawn.spawn( 'ls', [ 'two' ], { } );
			const bs3 = batchSpawn.spawn( 'ls', [ 'three' ], { } );
			batchSpawn.spawn( 'ls', [ 'four' ], { } );
			batchSpawn.spawn( 'ls', [ 'five' ], { } );

			expect( spawnSpy ).toHaveBeenNthCalledWith( 1, 'ls', [ 'one' ], { stdio: 'inherit' } );
			expect( spawnSpy ).toHaveBeenNthCalledWith( 2, 'ls', [ 'two' ], { stdio: 'inherit' } );
			expect( spawnSpy ).toHaveBeenCalledTimes( 2 );

			cp1.emit( 'exit', 0 );
			expect( spawnSpy ).toHaveBeenNthCalledWith( 3, 'ls', [ 'three' ], { stdio: 'inherit' } );
			expect( spawnSpy ).toHaveBeenCalledTimes( 3 );

			cp2.emit( 'error', new Error( 'test error' ) );
			await expect( bs2 ).rejects.toEqual( new Error( 'test error' ) );
			expect( spawnSpy ).toHaveBeenNthCalledWith( 4, 'ls', [ 'four' ], { stdio: 'inherit' } );
			expect( spawnSpy ).toHaveBeenCalledTimes( 4 );

			cp3.emit( 'exit', 1 );
			await expect( bs3 ).rejects.toEqual( new Error( 'Exit with error code 1' ) );
			expect( spawnSpy ).toHaveBeenNthCalledWith( 5, 'ls', [ 'five' ], { stdio: 'inherit' } );
			expect( spawnSpy ).toHaveBeenCalledTimes( 5 );
		} );
	} );
} );
