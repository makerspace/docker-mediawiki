( function ( M ) {

	var extendSearchParams = M.require( 'mobile.search.util/extendSearchParams' );

	QUnit.module( 'mobile.search.util/extendSearchParams', QUnit.newMwEnvironment( {
		config: {
			wgMFSearchAPIParams: {
				foo: 'bar'
			},
			wgMFQueryPropModules: [ 'baz' ],
			wgMFDisplayWikibaseDescriptions: {
				search: true,
				nearby: false
			}
		}
	} ) );

	QUnit.test( 'it throws if the feature is invalid', function ( assert ) {
		var expectedError = new Error( '"foo" isn\'t a feature that shows Wikibase descriptions.' );

		assert.throws( function () {
			extendSearchParams( 'foo', {} );
		}, expectedError );
	} );

	QUnit.test( 'it extends the parameters', function ( assert ) {
		var params = extendSearchParams( 'search', {
				qux: 'quux',
				prop: [ 'corge' ]
			} ),
			expectedParams = {
				qux: 'quux',
				foo: 'bar', // from wgMFSearchAPIParams
				prop: [ 'corge', 'baz', 'pageterms' ], // from wgMFQueryPropModules and Wikibase-specific
				wbptterms: 'description'
			};

		assert.deepEqual( params, expectedParams );
	} );

	QUnit.test( 'it doesn\'t include Wikibase-specific parameters if the feature is disabled', function ( assert ) {
		var params = extendSearchParams( 'nearby', {
			qux: 'quux'
		} );

		assert.equal( params.prop.indexOf( 'pageterms' ), -1 );
		assert.equal( params.wbptterms, undefined );
	} );

	QUnit.test( 'it adds the MobileFrontend configuration to given terms types', function ( assert ) {
		var params = extendSearchParams( 'search', {
			wbptterms: 'grault'
		} );

		assert.equal(
			params.wbptterms,
			'grault|description',
			'The given "wbptterms" is added to the default.'
		);
	} );

	QUnit.test( 'it prioritizes MobileFrontend configuration', function ( assert ) {
		var params = extendSearchParams( 'search', {
				foo: 'quux'
			} ),
			expectedParams = {
				foo: 'bar',
				prop: [ 'baz', 'pageterms' ],
				wbptterms: 'description'
			};

		assert.deepEqual(
			params,
			expectedParams,
			'The value of "foo" is overridden by the configuration.'
		);
	} );

	QUnit.test( 'it is variadic', function ( assert ) {
		var params = extendSearchParams(
				'search',
				{
					baz: 'qux'
				},
				{
					quux: 'corge'
				}
			),
			expectedParams = {
				foo: 'bar',
				baz: 'qux',
				quux: 'corge',
				prop: [ 'baz', 'pageterms' ],
				wbptterms: 'description'
			};

		assert.deepEqual( params, expectedParams );
	} );

}( mw.mobileFrontend ) );
