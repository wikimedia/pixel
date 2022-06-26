// eslint-disable-next-line node/no-missing-require
const backstop = require( 'backstopjs' );

/**
 * @typedef {Object} Reporter
 * @property {Function} onStart
 * @property {Function} onEnd
 */

/**
 * @typedef {Object} Opts
 * @property {'reference'|'test'} type
 * @property {Reporter} reporter
 * @property {any} config
 */

/**
 * Runs all tests from the passed in config and fires hooks on the injected
 * reporter.
 */
class Runner {
	/** @type {Opts} */ #opts;

	/**
	 * @param {Opts} opts
	 */
	constructor( opts ) {
		this.#opts = opts;
	}

	async run() {
		try {
			this.#opts.reporter.onStart();

			// @ts-ignore
			await backstop( this.#opts.type, { config: this.#opts.config } );
			this.#opts.reporter.onEnd( 'pass' );
		} catch ( e ) {
			if ( e instanceof Error && e.message.includes( 'Mismatch errors found' ) ) {
				this.#opts.reporter.onEnd( 'fail' );
			}

			throw e;
		}
	}
}

module.exports = Runner;
