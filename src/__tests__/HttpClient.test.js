const https = require( 'https' );
const http = require( 'http' );
const HttpClient = require( '../HttpClient' );
const { Socket } = require( 'net' );

jest.mock( 'https' );

describe( 'HttpClient', () => {
	afterEach( () => {
		/** @type {jest.Mock} */ ( https.get ).mockReset();
	} );

	describe( 'get', () => {
		it( 'resolves to a string', async () => {
			// Silence console messages.
			jest.spyOn( console, 'log' ).mockImplementation( () => {} );

			const httpClient = new HttpClient();
			const incomingMessage = new http.IncomingMessage( new Socket() );

			/** @type {jest.Mock} */ ( https.get ).mockImplementation( ( url, callback ) => {
				callback( incomingMessage );

				incomingMessage.emit( 'data', 'Main' );
				incomingMessage.emit( 'data', 'Page' );
				incomingMessage.emit( 'end' );
			} );
			const result = await httpClient.get( 'https://en.wikipedia.org/wiki/Main_Page' );

			expect( result ).toBe( 'MainPage' );
		} );

		it( 'rejects when an error occurs', async () => {
			// Silence console messages.
			jest.spyOn( console, 'log' ).mockImplementation( () => {} );
			jest.spyOn( console, 'error' ).mockImplementation( () => {} );

			const httpClient = new HttpClient();
			const incomingMessage = new http.IncomingMessage( new Socket() );

			/** @type {jest.Mock} */ ( https.get ).mockImplementation( ( url, callback ) => {
				callback( incomingMessage );

				incomingMessage.emit( 'error', new Error( 'Internal Server Error' ) );
			} );

			await expect( httpClient.get( 'https://en.wikipedia.org/wiki/Main_Page' ) ).rejects.toThrow( 'Internal Server Error' );
		} );
	} );
} );
