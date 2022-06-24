const spawn = require( 'child_process' ).spawn;

/**
 * @typedef {Object} Command
 * @property {Function} resolve
 * @property {string} command
 * @property {string[]} args
 * @property {Object} opts
 */

/**
 * Extends Node's spawn function to enable parallel processing of commands
 * limited by a batch size.
 */
class BatchSpawn {
	#batchSize;
	/** @type { Command[] } */ #commandQueue = [];
	/** @type { Map<Promise<any>, boolean> } */ #promiseMap = new Map();

	/**
	 * @param {number} [batchSize = 1]
	 */
	constructor( batchSize = 1 ) {
		this.#batchSize = batchSize;
	}

	/**
	 * Promisify Node's spawn function. If the number of commands that are
	 * currently being processed has exceeded the  `batchSize`, the command will
	 * be queued until the number of parallel commands is less than the batchSize.
	 *
	 * @param {string} command
	 * @param {string[]} args
	 * @param {Object} [opts]
	 * @return {Promise<undefined>}
	 */
	spawn( command, args, opts ) {
		if ( this.#promiseMap.size >= this.#batchSize ) {
			return new Promise( ( resolve ) => {
				this.#commandQueue.push( {
					resolve,
					command,
					args,
					opts: opts || {}
				} );
			} );
		}

		const promise = new Promise( ( resolve, reject ) => {
			const childProcess = spawn(
				command,
				args,
				{ stdio: 'inherit', ...opts }
			);

			childProcess.on( 'error', ( err ) => {
				this.#dequeue( promise );

				reject( err );
			} );

			childProcess.on( 'exit', ( code ) => {
				this.#dequeue( promise );

				if ( code === 0 ) {
					resolve( undefined );
					return;
				}

				reject( new Error( `BatchSpawn: Exit with error code ${code}` ) );
			} );

		} );

		this.#promiseMap.set( promise, true );

		return promise;
	}

	/**
	 * Removes the passed in promise from the promiseMap and executes the next
	 * command in queue (if any).
	 *
	 * @param {Promise<any>} promise
	 */
	#dequeue( promise ) {
		this.#promiseMap.delete( promise );

		if ( this.#commandQueue.length ) {
			const command = /** @type {Command} */ ( this.#commandQueue.shift() );
			command.resolve( this.spawn( command.command, command.args, command.opts ) );
		}
	}

}

module.exports = BatchSpawn;
