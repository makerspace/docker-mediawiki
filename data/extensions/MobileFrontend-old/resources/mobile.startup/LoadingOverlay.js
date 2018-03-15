( function ( M ) {
	var Overlay = M.require( 'mobile.startup/Overlay' );

	/**
	 * Overlay that initially shows loading animation until
	 * caller hides it with .hide()
	 * @class LoadingOverlay
	 * @extends Overlay
	 */
	function LoadingOverlay() {
		Overlay.apply( this, arguments );
	}

	OO.mfExtend( LoadingOverlay, Overlay, {
		template: mw.template.get( 'mobile.startup', 'LoadingOverlay.hogan' )
	} );

	M.define( 'mobile.startup/LoadingOverlay', LoadingOverlay )
		.deprecate( 'mobile.overlays/LoadingOverlay' );

}( mw.mobileFrontend ) );
