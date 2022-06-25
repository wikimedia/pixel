const HttpClient = require( './HttpClient' );

/**
 * An extremely minimal gerrit web client. Only has 1 method - `get`!
 */
class GerritClient {
	#httpClient;
	#baseUrl;

	/**
	 * @param {string} baseUrl
	 */
	constructor( baseUrl ) {
		this.#httpClient = new HttpClient();
		this.#baseUrl = baseUrl;
	}

	/**
	 * @param {string} path
	 * @return {Promise<any>}
	 */
	async get( path ) {
		const url = `${this.#baseUrl}${path}`;
		const res = await this.#httpClient.get( url );

		return JSON.parse( res.slice( 4 ) );
	}
}

module.exports = GerritClient;
