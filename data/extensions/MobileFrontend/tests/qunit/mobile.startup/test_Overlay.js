( function ( M, $ ) {
	var Overlay = M.require( 'mobile.startup/Overlay' );

	QUnit.module( 'MobileFrontend: Overlay.js', {
		setup: function () {
			this.clock = this.sandbox.useFakeTimers();
		}
	} );

	QUnit.test( 'Simple overlay', function ( assert ) {
		var overlay = new Overlay( {
			heading: '<h2>Title</h2>',
			content: 'Text'
		} );
		overlay.show();
		assert.ok( overlay.$el[ 0 ].parentNode !== undefined, 'In DOM' );
		overlay.hide();
	} );

	QUnit.test( 'HTML overlay', function ( assert ) {
		var overlay;

		function TestOverlay() {
			Overlay.apply( this, arguments );
		}

		OO.mfExtend( TestOverlay, Overlay, {
			templatePartials: $.extend( Overlay.prototype.templatePartials, {
				content: mw.template.compile( '<div class="content">YO</div>', 'hogan' )
			} )
		} );
		overlay = new TestOverlay( {
			heading: 'Awesome'
		} );
		assert.strictEqual( overlay.$el.find( 'h2' ).html(), 'Awesome' );
		assert.strictEqual( overlay.$el.find( '.content' ).text(), 'YO' );
	} );

	QUnit.test( 'Close overlay', function ( assert ) {
		var overlay = new Overlay( {
			heading: '<h2>Title</h2>',
			content: 'Text'
		} );
		overlay.show();
		overlay.hide();
		this.clock.tick( 1000 );
		assert.strictEqual( overlay.$el[ 0 ].parentNode, null, 'No longer in DOM' );
	} );
}( mw.mobileFrontend, jQuery ) );
