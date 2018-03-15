<?php
/**
 * SpecialUploads.php
 */

/**
 * Provides a special page with a list of uploaded items/images of a User
 */
class SpecialUploads extends MobileSpecialPage {
	/** @var boolean $hasDesktopVersion Whether the mobile special page has a desktop special page */
	protected $hasDesktopVersion = true;
	/**
	 * Construct function
	 */
	public function __construct() {
		parent::__construct( 'Uploads' );
	}

	/**
	 * Render the special page
	 * @param string|null $par Username to get uploads from
	 */
	public function executeWhenAvailable( $par = '' ) {
		if ( ( $par === '' || $par === null ) && $this->getUser()->isAnon() ) {
			// Anons don't get to see Special:Uploads
			$this->requireLogin( 'mobile-frontend-donate-image-anon' );
		} else {
			// uploads by a particular user, i.e Special:Uploads/username, are shown even to anons
			$this->setHeaders();
			$output = $this->getOutput();
			$output->addJsConfigVars(
				'wgMFPhotoUploadEndpoint',
				$this->getMFConfig()->get( 'MFPhotoUploadEndpoint' )
			);

			if ( $par !== '' && $par !== null ) {
				$user = User::newFromName( $par );
				if ( !$user || $user->isAnon() ) {
					$output->setPageTitle( $this->msg( 'mobile-frontend-donate-image-title-username', $par ) );
					$output->setStatusCode( 404 );
					$html = MobileUI::contentElement(
						MobileUI::errorBox(
							$this->msg( 'mobile-frontend-photo-upload-invalid-user', $par ) )
					);
				} else {
					if ( $user->equals( $this->getUser() ) ) {
						$output->setPageTitle( $this->msg( 'mobile-frontend-donate-image-title-you' ) );
					} else {
						$output->setPageTitle( $this->msg( 'mobile-frontend-donate-image-title-username', $par ) );
					}
					$html = $this->getUserUploadsPageHtml( $user );
				}
			} else {
				$user = $this->getUser();
				$output->setPageTitle( $this->msg( 'mobile-frontend-donate-image-title-you' ) );
				// TODO: what if the user cannot upload to the destination wiki in $wgMFPhotoUploadEndpoint?
				$html = $this->getUserUploadsPageHtml( $user );
			}
			$output->addHTML( $html );
		}
	}
	/**
	 * Generates HTML for the uploads page for the passed user.
	 *
	 * @param User $user
	 * @return string
	 */
	public function getUserUploadsPageHtml( User $user ) {
		$uploadCount = $this->getUserUploadCount( $user->getName() );

		$html = '';
		$attrs = [];
		if ( $uploadCount !== false ) {
			$threshold = $this->getUploadCountThreshold();
			// FIXME: Use Html class?
			$html .= '<div class="content">';
			if ( $uploadCount > $threshold ) {
				$msg = $this->msg(
					'mobile-frontend-photo-upload-user-count-over-limit'
				)->text();
			} else {
				$msg = $this->msg(
					'mobile-frontend-photo-upload-user-count'
				)->numParams( $uploadCount )->parse();
				if ( $uploadCount === 0 ) {
					$attrs = [ 'style' => 'display:none' ];
				}
			}
			$html .= Html::openElement( 'h2', $attrs ) . $msg . Html::closeElement( 'h2' );
			$html .= '</div>';
		}
		return $html;
	}

	/**
	 * Fetches number of uploads for a given username
	 *
	 * We use 'username' here rather than id to take advantage of indexes.
	 *
	 * @TODO add memcache support
	 *
	 * @param string $username
	 * @return int|bool Will return the # of images (up to the threshold + 1)
	 *		or will return false if there are database errors.
	 */
	private function getUserUploadCount( $username ) {
		global $wgConf;

		$mfPhotoUploadWiki = $this->getMFConfig()->get( 'MFPhotoUploadWiki' );
		if ( !$mfPhotoUploadWiki ) {
			$dbr = wfGetDB( DB_SLAVE );
		} elseif (
				$mfPhotoUploadWiki &&
				!in_array( $mfPhotoUploadWiki, $wgConf->getLocalDatabases() )
			) {
			// early return if the database is invalid
			return false;
		} else {
			$dbr = wfGetDB( DB_SLAVE, [], $mfPhotoUploadWiki );
		}

		$limit = $this->getUploadCountThreshold() + 1;
		// not using SQL's count(*) because it's more expensive with big number of rows
		$res = $dbr->select(
			'image',
			'img_size',
			[ 'img_user_text' => $username ],
			__METHOD__,
			[ 'LIMIT' => $limit ]
		);
		return ( $res ) ? $res->numRows() : false;
	}

	/**
	 * Getter for upload count threshold
	 *
	 * Currently hardcoded as 500; using this handy method to simplify possible
	 * changes in the future.
	 *
	 * @return int
	 */
	public function getUploadCountThreshold() {
		return 500;
	}
}
