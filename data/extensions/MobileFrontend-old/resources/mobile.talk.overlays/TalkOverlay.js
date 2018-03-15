( function ( M, $ ) {
	var TalkOverlayBase = M.require( 'mobile.talk.overlays/TalkOverlayBase' ),
		Page = M.require( 'mobile.startup/Page' ),
		Anchor = M.require( 'mobile.startup/Anchor' ),
		user = M.require( 'mobile.startup/user' );
	/**
	 * Overlay for talk page
	 * @extends TalkOverlayBase
	 * @class TalkOverlay
	 * @uses Page
	 * @uses TalkSectionOverlay
	 * @uses TalkSectionAddOverlay
	 */
	function TalkOverlay() {
		TalkOverlayBase.apply( this, arguments );
	}

	OO.mfExtend( TalkOverlay, TalkOverlayBase, {
		templatePartials: $.extend( {}, TalkOverlayBase.prototype.templatePartials, {
			content: mw.template.get( 'mobile.talk.overlays', 'content.hogan' )
		} ),
		/**
		 * @inheritdoc
		 * @cfg {Object} defaults Default options hash.
		 * @cfg {Array} defaults.headings A list of {Section} objects to render heading links
		 * for. If not set ajax request will be performed.
		 * @cfg {string} defaults.heading Heading for talk overlay.
		 * @cfg {string} defaults.leadHeading Heading for a discussion which has no heading
		 * (lead section of talk page).
		 * @cfg {string} defaults.headerButtonsListClassName Class name of the header buttons
		 * list
		 * @cfg {Array} defaults.headerButtons Objects that will be used as defaults for
		 * generating header buttons. Default list includes an 'add' button, which opens
		 * a new talk overlay.
		 */
		defaults: $.extend( {}, TalkOverlayBase.prototype.defaults, {
			headings: undefined,
			heading: '<strong>' + mw.msg( 'mobile-frontend-talk-overlay-header' ) + '</strong>',
			leadHeading: mw.msg( 'mobile-frontend-talk-overlay-lead-header' ),
			headerButtonsListClassName: 'header-action',
			headerButtons: [ {
				href: '#/talk/new',
				className: 'add continue hidden',
				msg: mw.msg( 'mobile-frontend-talk-add-overlay-submit' )
			} ],
			footerAnchor: new Anchor( {
				progressive: true,
				additionalClassNames: 'footer-link talk-fullpage',
				label: mw.msg( 'mobile-frontend-talk-fullpage' )
			} ).options
		} ),

		/** @inheritdoc */
		postRender: function () {
			TalkOverlayBase.prototype.postRender.apply( this );
			this.$board = this.$( '.board' );
			this.$( '.talk-fullpage' ).attr( 'href', mw.util.getUrl( this.options.title ) )
				.removeClass( 'hidden' );
			if ( !this.options.headings ) {
				this._loadContent( this.options );
			}
			this._setupAddDiscussionButton( this.options );
			this.showHidden( '.initial-header' );
		},

		/**
		 * Show a loading spinner
		 * @method
		 */
		showSpinner: function () {
			this.$board.hide();
			TalkOverlayBase.prototype.showSpinner.apply( this, arguments );
		},

		/**
		 * Hide the loading spinner
		 * @method
		 */
		clearSpinner: function () {
			TalkOverlayBase.prototype.clearSpinner.apply( this, arguments );
			this.$board.show();
		},

		/**
		 * Load content of the talk page into the overlay
		 * @method
		 * @param {Object} options for the overlay
		 * @private
		 */
		_loadContent: function ( options ) {
			var self = this;

			// show a spinner
			this.showSpinner();

			// clear actual content, if any
			this.$( '.topic-title-list' ).empty();

			this.pageGateway.getPage( options.title ).fail( function ( resp ) {
				// If the API returns the error code 'missingtitle', that means the
				// talk page doesn't exist yet.
				if ( resp === 'missingtitle' ) {
					// Create an empty page for new pages
					self._addContent( {
						title: options.title,
						sections: []
					}, options );
				} else {
					// If the API request fails for any other reason, load the talk
					// page manually rather than leaving the spinner spinning.
					window.location = mw.util.getUrl( options.title );
				}
			} ).done( function ( pageData ) {
				self._addContent( pageData, options );
			} );
		},

		/**
		 * Adds the content received from _loadContent to the Overlay and re-renders it.
		 * @method
		 * @private
		 * @param {Object} pageData As returned from PageApi#getPage
		 * @param {Object} options for the overlay
		 */
		_addContent: function ( pageData, options ) {
			var page = new Page( pageData ),
				sections = page.getSections();

			this.page = page;

			options.explanation = sections.length > 0 ? mw.msg( 'mobile-frontend-talk-explained' ) :
				mw.msg( 'mobile-frontend-talk-explained-empty' );
			options.headings = sections;

			// content is there so re-render and hide the spinner
			this.render( options );
			this.clearSpinner();
		},
		/**
		 * Shows the add topic button to logged in users.
		 * Ensures the overlay refreshes when a discussion is added.
		 * @method
		 * @private
		 */
		_setupAddDiscussionButton: function () {
			var $add = this.$( '.header-action .add' );
			M.on( 'talk-discussion-added', $.proxy( this, '_loadContent', this.options ) );
			if ( !user.isAnon() ) {
				$add.removeClass( 'hidden' );
			} else {
				$add.remove();
			}
		}
	} );

	M.define( 'mobile.talk.overlays/TalkOverlay', TalkOverlay ); // resource-modules-disable-line

}( mw.mobileFrontend, jQuery ) );
