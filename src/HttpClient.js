const https = require( 'https' );

/**
 * An extremely minimal web client. Only has 1 method - `get`!
 */
class HttpClient {
	/**
	 * @param {string} url
	 * @return {Promise<string>}
	 */
	async get( url ) {
		console.log( `Requesting ${url}` );

		let data = '';
		return new Promise( ( resolve, reject ) => {
			https.get( url, ( res ) => {
				res.setEncoding( 'utf8' );

				res.on( 'data', ( chunk ) => {
					data += chunk;
				} );

				res.on( 'end', () => {
					resolve( data );
				} );

				res.on( 'error', ( e ) => {
					console.error( e );
					reject( e );
				} );
			} );
		} );
	}

}

module.exports = HttpClient;
