( function ( M, $ ) {
	var Overlay = M.require( 'mobile.startup/Overlay' ),
		Anchor = M.require( 'mobile.startup/Anchor' ),
		NotificationsOverlay;

	/**
	 * Overlay for notifications
	 * @class NotificationsOverlay
	 * @extend Overlay
	 * @uses mw.Api
	 *
	 * @constructor
	 * @param {Object} options Configuration options
	 */
	NotificationsOverlay = function ( options ) {
		var modelManager, unreadCounter, wrapperWidget,
			self = this,
			maxNotificationCount = mw.config.get( 'wgEchoMaxNotificationCount' ),
			echoApi = new mw.echo.api.EchoApi();

		Overlay.apply( this, options );

		// Anchor tag that corresponds to a notifications badge
		this.badge = options.badge;
		this.$overlay = $( '<div>' )
			.addClass( 'notifications-overlay-overlay position-fixed' );

		// On error use the url as a fallback
		if ( options.error ) {
			this.onError();
			return;
		}

		mw.echo.config.maxPrioritizedActions = 1;

		this.doneLoading = false;

		unreadCounter = new mw.echo.dm.UnreadNotificationCounter( echoApi, 'all', maxNotificationCount );
		modelManager = new mw.echo.dm.ModelManager( unreadCounter, { type: [ 'message', 'alert' ] } );
		this.controller = new mw.echo.Controller(
			echoApi,
			modelManager,
			{
				type: [ 'message', 'alert' ]
			}
		);

		wrapperWidget = new mw.echo.ui.NotificationsWrapper( this.controller, modelManager, {
			$overlay: this.$overlay
		} );

		// Mark all read
		this.markAllReadButton = new OO.ui.ButtonWidget( {
			icon: 'doubleCheck',
			title: mw.msg( 'echo-mark-all-as-read' )
		} );
		this.markAllReadButton.toggle( false );
		this.$( '.overlay-header' )
			.append(
				$( '<div>' )
					.addClass( 'notifications-overlay-header-markAllRead' )
					.append(
						this.markAllReadButton.$element
					)
			);

		// TODO: We should be using 'toast' (which uses mw.notify)
		// when this bug is fixed: https://phabricator.wikimedia.org/T143837
		this.confirmationWidget = new mw.echo.ui.ConfirmationPopupWidget();
		this.$overlay.append( this.confirmationWidget.$element );

		// Events
		unreadCounter.connect( this, {
			countChange: 'onUnreadCountChange'
		} );
		modelManager.connect( this, {
			update: 'checkShowMarkAllRead'
		} );
		this.markAllReadButton.connect( this, {
			click: 'onMarkAllReadButtonClick'
		} );

		// Initialize
		this.$( '.overlay-content' ).append(
			wrapperWidget.$element,
			this.$overlay
		);

		// Populate notifications
		wrapperWidget.populate().then( function () {
			self.setDoneLoading();
			self.controller.updateSeenTime();
			self.badge.markAsSeen();
			self.checkShowMarkAllRead();
		} );
	};

	OO.mfExtend( NotificationsOverlay, Overlay, {
		className: 'overlay notifications-overlay navigation-drawer',
		isBorderBox: false,
		/**
		 * @inheritdoc
		 * @cfg {Object} defaults Default options hash.
		 * @cfg {string} defaults.heading Heading text.
		 */
		defaults: $.extend( {}, Overlay.prototype.defaults, {
			heading: mw.msg( 'notifications' ),
			footerAnchor: new Anchor( {
				href: mw.util.getUrl( 'Special:Notifications' ),
				progressive: true,
				additionalClassNames: 'footer-link notifications-archive-link',
				label: mw.msg( 'echo-overlay-link' )
			} ).options
		} ),
		/**
		 * Set done loading flag for notifications list
		 *
		 * @method
		 */
		setDoneLoading: function () {
			this.doneLoading = true;
		},
		/**
		 * Check if notifications have finished loading
		 *
		 * @method
		 * @return {boolean} Notifications list has finished loading
		 */
		isDoneLoading: function () {
			return this.doneLoading;
		},
		/**
		 * Toggle mark all read button
		 *
		 * @method
		 */
		checkShowMarkAllRead: function () {
			this.markAllReadButton.toggle(
				this.isDoneLoading() &&
				this.controller.manager.hasLocalUnread()
			);
		},
		/**
		 * Respond to mark all read button click
		 */
		onMarkAllReadButtonClick: function () {
			var overlay = this,
				numNotifications = this.controller.manager.getLocalUnread().length;

			this.controller.markLocalNotificationsRead()
				.then( function () {
					overlay.confirmationWidget.setLabel(
						mw.msg( 'echo-mark-all-as-read-confirmation', numNotifications )
					);
					overlay.confirmationWidget.showAnimated();
				} );
		},
		/**
		 * Fall back to notifications archive page.
		 * @method
		 */
		onError: function () {
			window.location.href = this.badge.getNotificationURL();
		},
		/**
		 * Update the unread number on the notifications badge
		 *
		 * @param {number} count Number of unread notifications
		 * @method
		 */
		onUnreadCountChange: function ( count ) {
			this.badge.setCount(
				this.controller.manager.getUnreadCounter().getCappedNotificationCount( count )
			);

			this.checkShowMarkAllRead();
		},

		/** @inheritdoc */
		preRender: function () {
			this.options.heading = '<strong>' + mw.message( 'notifications' ).escaped() + '</strong>';
		},
		/** @inheritdoc */
		postRender: function () {
			Overlay.prototype.postRender.apply( this );

			if ( this.options.notifications || this.options.errorMessage ) {
				this.$( '.loading' ).remove();
			}
		}
	} );

	M.define( 'mobile.notifications.overlay/NotificationsOverlay', NotificationsOverlay );

}( mw.mobileFrontend, jQuery ) );
