const GerritClient = require( '../GerritClient' );
const HttpClient = require( '../HttpClient' );

jest.mock( '../HttpClient' );

describe( 'GerritClient', () => {
	afterEach( () => {
		/** @type {jest.Mock} */ ( HttpClient ).mockClear();
	} );

	describe( 'get', () => {
		it( 'resolves to parsed json', async () => {
			const gerritClient = new GerritClient( 'https://gerrit.wikimedia.org/r' );

			// @ts-ignore
			/** @type {jest.Mock} */ ( HttpClient.mock.instances[ 0 ].get )
				.mockImplementation( async () => {
					return `
					)]}'
					{"changes":[]}
					`.trim();
				} );

			const result = await gerritClient.get( '/path' );
			expect( result ).toStrictEqual( { changes: [] } );
		} );
	} );

} );
