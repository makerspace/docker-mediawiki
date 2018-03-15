( function ( $, M ) {

	var ReferencesHtmlScraperGateway = M.require(
			'mobile.references.gateway/ReferencesHtmlScraperGateway' ),
		ReferencesGateway = M.require( 'mobile.references.gateway/ReferencesGateway' ),
		Page = M.require( 'mobile.startup/Page' );

	QUnit.module( 'MobileFrontend: htmlScraper references gateway', {
		setup: function () {
			this.$container = mw.template.get( 'tests.mobilefrontend', 'references.html' )
				.render().appendTo( '#qunit-fixture' );
			this.page = new Page( {
				el: this.$container,
				title: 'Reftest'
			} );
			this.referencesGateway = new ReferencesHtmlScraperGateway( new mw.Api() );
			// we use Page object which calls getUrl which uses config variables.
			this.sandbox.stub( mw.util, 'getUrl' ).returns( '/wiki/Reftest' );
		}
	} );

	QUnit.test( 'checking good reference', function ( assert ) {
		return this.referencesGateway.getReference( '#cite_note-1', this.page ).done( function ( ref ) {
			assert.strictEqual( $( '<div>' ).html( ref.text ).find( '.reference-text' ).text(), 'hello' );
		} );
	} );

	QUnit.test( 'checking bad reference', function ( assert ) {
		var done = $.Deferred();
		this.referencesGateway.getReference( '#cite_note-bad', this.page ).fail( function ( err ) {
			assert.ok( err === ReferencesGateway.ERROR_NOT_EXIST, 'When bad id given false returned.' );
			done.resolve();
		} );
		return done;
	} );

}( jQuery, mw.mobileFrontend ) );
