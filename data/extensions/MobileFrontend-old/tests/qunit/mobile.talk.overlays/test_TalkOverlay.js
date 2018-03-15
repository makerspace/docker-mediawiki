( function ( M, $ ) {

	var PageGateway = M.require( 'mobile.startup/PageGateway' ),
		TalkOverlay = M.require( 'mobile.talk.overlays/TalkOverlay' );

	QUnit.module( 'MobileFrontend TalkOverlay', {
		setup: function () {
			this.api = new mw.Api();
			this.sandbox.stub( PageGateway.prototype, 'getPage' ).withArgs( 'Talk:No exist' ).returns(
				$.Deferred().reject( 'missingtitle' )
			).withArgs( 'Talk:Topic' ).returns(
				$.Deferred().resolve( {
					title: 'Talk:Topic',
					id: 1,
					lead: '',
					sections: [
						{
							id: 50,
							line: 'Topic 1'
						}
					]
				} )
			);

			this.user = mw.user.getName() || '';
		},
		teardown: function () {
			mw.config.set( 'wgUserName', this.user );
		}
	} );

	QUnit.test( '#TalkOverlay (new page; anonymous)', function ( assert ) {
		var options = {
				api: this.api,
				title: 'Talk:No exist'
			},
			overlay = new TalkOverlay( options ),
			page = overlay.page;

		mw.config.set( 'wgUserName', null );
		assert.strictEqual( page.title, 'Talk:No exist', 'Title set' );
		assert.strictEqual( page.getSections().length, 0, 'A page was setup with no sections' );

		// reload discussion board via ajax
		overlay._loadContent( options );
		assert.strictEqual( page.getSections().length, 0, 'Discussions reloaded, still no sections' );

		// check whether there is an Add discussion button
		assert.strictEqual( overlay.$( '.add' ).length, 0, 'There is no "Add discussion" button' );
	} );

	QUnit.test( '#TalkOverlay (logged in)', function ( assert ) {
		var overlay;

		mw.config.set( 'wgUserName', 'FlorianSW' );
		overlay = new TalkOverlay( {
			api: this.api,
			title: 'Talk:No exist'
		} );

		assert.ok( overlay.$( '.add' ).length > 0, 'There is an "Add discussion" button' );
		assert.strictEqual( overlay.$( '.content-header' ).text().trim(),
			mw.msg( 'mobile-frontend-talk-explained-empty' ),
			'Check the header knows it is empty.' );
	} );

	QUnit.test( '#TalkOverlay (existing page lists section headings)', function ( assert ) {
		var overlay = new TalkOverlay( {
			api: this.api,
			title: 'Talk:Topic'
		} );

		assert.ok( overlay.$( '.topic-title-list li' ).length === 1, 'One topic heading is listed' );
		assert.strictEqual( overlay.$( '.topic-title-list li a' ).eq( 0 ).text(), 'Topic 1',
			'The text of the second item is the section heading.' );
		assert.strictEqual( overlay.$( '.topic-title-list li a' ).data( 'id' ), 50,
			'The data id is set.' );
		assert.strictEqual( overlay.$( '.content-header' ).text().trim(),
			mw.msg( 'mobile-frontend-talk-explained' ),
			'Check the header knows it is not empty.' );
	} );

}( mw.mobileFrontend, jQuery ) );
