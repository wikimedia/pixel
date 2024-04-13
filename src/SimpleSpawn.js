const { spawn } = require( 'child_process' );
const util = require( 'util' );
const exec = util.promisify( require( 'child_process' ).exec );
const path = require( 'path' );

class SimpleSpawn {
	/**
	 * Log the command execution details.
	 *
	 * @param {string} methodName
	 * @param {string} command
	 * @param {string[]} args
	 */
	logExecution( methodName, command, args = [] ) {
		if ( process.env.SPAWN_DEBUG !== '1' ) {
			return;
		}
		const callerInfo = this.getCallerInfo();
		const completeCommand = `${command} ${args.join( ' ' )}`;
		console.log( '\x1b[32m%s\x1b[0m', `\n\nShell '${methodName}' invocation` );
		console.log( '\x1b[32m%s\x1b[0m', `( ${callerInfo} )` );
		console.log( '\x1b[34m%s\x1b[0m', `\n${completeCommand}\n\n` );
	}

	/**
	 * Promisify Node's exec function.
	 *
	 * @param {string} command
	 * @return {Promise<{stdout: string, stderr: string}>}
	 */
	exec( command ) {
		this.logExecution( 'exec', command );
		return exec( command );
	}

	/**
	 * Promisify Node's spawn function.
	 *
	 * @param {string} command
	 * @param {string[]} args
	 * @param {Object} [opts]
	 * @return {Promise<undefined>}
	 */
	spawn( command, args = [], opts = {} ) {
		this.logExecution( 'spawn', command, args );
		return new Promise( ( resolve, reject ) => {
			const childProcess = spawn( command, args, { stdio: 'inherit', ...opts } );

			childProcess.on( 'error', ( err ) => {
				reject( err );
			} );

			childProcess.on( 'exit', ( code ) => {
				if ( code === 0 ) {
					resolve( undefined );
					return;
				}

				reject( new Error( `
=========================
command exited: \x1b[34m${command} ${args.join( ' ' )}\x1b[0m
error code: \x1b[31m${code}\x1b[0m
opts: \x1b[32m${JSON.stringify( opts, null, 2 )}\x1b[0m
=========================
				` ) );
			} );
		} );
	}

	/**
	 * Get the file name, function name, and line number of the caller.
	 *
	 * @return {string}
	 */
	getCallerInfo() {
		const originalPrepareStackTrace = Error.prepareStackTrace;
		Error.prepareStackTrace = ( _, innerStack ) => innerStack;
		const error = new Error();
		const stack = error.stack;
		Error.prepareStackTrace = originalPrepareStackTrace;

		if ( Array.isArray( stack ) ) {
			const externalCaller = stack.find( ( caller ) => {
				return caller.getFileName && !caller.getFileName().endsWith( 'SimpleSpawn.js' );
			} );

			if ( externalCaller ) {
				const callerFile = externalCaller.getFileName() || '';
				const callerFileName = path.basename( callerFile );
				const callerFunction = externalCaller.getFunctionName();
				const callerLineNumber = externalCaller.getLineNumber();

				return `called by '${callerFunction || ''}' in '${callerFileName}' on line ${callerLineNumber}`;
			}
		}

		return 'Unknown location';
	}

}

module.exports = SimpleSpawn;
