<?php
/**
 * SpecialMobileOptions.php
 */

/**
 * Adds a special page with mobile specific preferences
 */
class SpecialMobileOptions extends MobileSpecialPage {
	/** @var Title The title of page to return to after save */
	private $returnToTitle;
	/** @var boolean $hasDesktopVersion Whether this special page has a desktop version or not */
	protected $hasDesktopVersion = true;
	/** @var array $options Used in the execute() function as a map of subpages to
	 functions that are executed when the request method is defined. */
	private $options = [
		'Language' => [ 'get' => 'chooseLanguage' ],
	];
	/** @var boolean Whether the special page's content should be wrapped in div.content */
	protected $unstyledContent = false;

	/**
	 * Construct function
	 */
	public function __construct() {
		parent::__construct( 'MobileOptions' );
	}

	public function doesWrites() {
		return true;
	}

	/**
	 * Render the special page
	 * @param string|null $par Parameter submitted as subpage
	 */
	public function execute( $par = '' ) {
		parent::execute( $par );
		$context = MobileContext::singleton();

		$this->returnToTitle = Title::newFromText( $this->getRequest()->getText( 'returnto' ) );
		if ( !$this->returnToTitle ) {
			$this->returnToTitle = Title::newMainPage();
		}

		$this->setHeaders();
		$context->setForceMobileView( true );
		$context->setContentTransformations( false );
		// check, if the subpage has a registered function, that needs to be executed
		if ( isset( $this->options[$par] ) ) {
			$option = $this->options[$par];

			// select the correct function for the given request method (post, get)
			if ( $this->getRequest()->wasPosted() && isset( $option['post'] ) ) {
				$func = $option['post'];
			} else {
				$func = $option['get'];
			}
			// run the function
			$this->$func();
		} else {
			if ( $this->getRequest()->wasPosted() ) {
				$this->submitSettingsForm();
			} else {
				$this->addSettingsForm();
			}
		}
	}

	/**
	 * Gets the Resource Loader modules that should be added to the output.
	 *
	 * @param MobileContext $context
	 * @return string[]
	 */
	private function getModules( MobileContext $context ) {
		$result = [];

		if ( $context->getConfigVariable( 'MinervaEnableFontChanger' ) ) {
			$result[] = 'mobile.special.mobileoptions.scripts.fontchanger';
		}

		return $result;
	}

	/**
	 * Render the settings form (with actual set settings) and add it to the
	 * output as well as any supporting modules.
	 */
	private function addSettingsForm() {
		$out = $this->getOutput();
		$context = MobileContext::singleton();
		$user = $this->getUser();

		$out->setPageTitle( $this->msg( 'mobile-frontend-main-menu-settings-heading' ) );

		if ( $this->getRequest()->getCheck( 'success' ) ) {
			$out->wrapWikiMsg(
				"<div class=\"successbox\"><strong>\n$1\n</strong></div><div id=\"mw-pref-clear\"></div>",
				'savedprefs'
			);
		}

		$betaEnabled = $context->isBetaGroupMember();

		$imagesBeta = $betaEnabled ? 'checked' : '';
		$betaEnableMsg = $this->msg( 'mobile-frontend-settings-beta' )->parse();
		$betaDescriptionMsg = $this->msg( 'mobile-frontend-opt-in-explain' )->parse();

		$saveSettings = $this->msg( 'mobile-frontend-save-settings' )->escaped();
		$action = $this->getPageTitle()->getLocalURL();
		$html = Html::openElement( 'form',
			[ 'class' => 'mw-mf-settings', 'method' => 'POST', 'action' => $action ]
		);
		$token = $user->isLoggedIn() ? Html::hidden( 'token', $user->getEditToken() ) : '';
		$returnto = Html::hidden( 'returnto', $this->returnToTitle->getFullText() );

		// array to save the data of options, which should be displayed here
		$options = [];

		// beta settings
		if ( $this->getMFConfig()->get( 'MFEnableBeta' ) ) {
			$options['beta'] = [
				'checked' => $imagesBeta,
				'label' => $betaEnableMsg,
				'description' => $betaDescriptionMsg,
				'name' => 'enableBeta',
				'id' => 'enable-beta-toggle',
			];
		}

		$templateParser = new TemplateParser(
			__DIR__ . '/../../resources/mobile.special.mobileoptions.scripts' );
		// @codingStandardsIgnoreStart Long line
		foreach( $options as $key => $data ) {
			if ( isset( $data['type'] ) && $data['type'] === 'hidden' ) {
				$html .= Html::element( 'input',
					array(
						'type' => 'hidden',
						'name' => $data['name'],
						'value' => $data['checked'],
					)
				);
			} else {
				$html .= $templateParser->processTemplate( 'checkbox', $data );
			}
		}
		$className = MobileUI::buttonClass( 'constructive' );
		$html .= <<<HTML
		<input type="submit" class="{$className}" id="mw-mf-settings-save" value="{$saveSettings}">
		$token
		$returnto
	</form>
HTML;
		// @codingStandardsIgnoreEnd
		$out->addHTML( $html );

		$modules = $this->getModules( $context );

		$this->getOutput()
			->addModules( $modules );
	}

	/**
	 * Get a list of languages available for this project
	 * @return string parsed Html
	 */
	private function getSiteSelector() {
		$selector = '';
		$count = 0;
		$language = $this->getLanguage();
		$interwikiLookup = \MediaWiki\MediaWikiServices::getInstance()->getInterwikiLookup();
		foreach ( $interwikiLookup->getAllPrefixes( true ) as $interwiki ) {
			$code = $interwiki['iw_prefix'];
			$name = Language::fetchLanguageName( $code, $language->getCode() );
			if ( !$name ) {
				continue;
			}
			$title = Title::newFromText( "$code:" );
			if ( $title ) {
				$url = $title->getFullURL();
			} else {
				$url = '';
			}
			$attrs = [ 'href' => $url ];
			$count++;
			if ( $code == $this->getConfig()->get( 'LanguageCode' ) ) {
				$attrs['class'] = 'selected';
			}
			$selector .= Html::openElement( 'li' );
			$selector .= Html::element( 'a', $attrs, $name );
			$selector .= Html::closeElement( 'li' );
		}

		if ( $selector && $count > 1 ) {
			$selector = <<<HTML
			<p>{$this->msg( 'mobile-frontend-settings-site-description', $count )->parse()}</p>
			<ul id='mw-mf-language-list'>
				{$selector}
			</ul>
HTML;
		}

		return $selector;
	}

	/**
	 * Render the language selector special page, callable through Special:MobileOptions/Language
	 * See the $options member variable of this class.
	 */
	private function chooseLanguage() {
		$out = $this->getOutput();
		$out->setPageTitle( $this->msg( 'mobile-frontend-settings-site-header' )->escaped() );
		$out->addHTML( $this->getSiteSelector() );
	}

	/**
	 * Saves the settings submitted by the settings form. Redirects the user to the destination
	 * of returnto or, if not set, back to this special page
	 */
	private function submitSettingsForm() {
		$schema = 'MobileOptionsTracking';
		$schemaRevision = 16934032;
		$schemaData = [
			'action' => 'success',
			'beta' => "nochange",
		];
		$context = MobileContext::singleton();
		$request = $this->getRequest();
		$user = $this->getUser();

		if ( $user->isLoggedIn() && !$user->matchEditToken( $request->getVal( 'token' ) ) ) {
			$errorText = __METHOD__ . '(): token mismatch';
			wfDebugLog( 'mobile', $errorText );
			$this->getOutput()->addHTML( '<div class="error">'
				. $this->msg( "mobile-frontend-save-error" )->parse()
				. '</div>'
			);
			$schemaData['action'] = 'error';
			$schemaData['errorText'] = $errorText;
			ExtMobileFrontend::eventLog( $schema, $schemaRevision, $schemaData );
			$this->addSettingsForm();
			return;
		}

		if ( $request->getBool( 'enableBeta' ) ) {
			$group = 'beta';
			if ( !$context->isBetaGroupMember() ) {
				// The request was to turn on beta
				$schemaData['beta'] = "on";
			}
		} else {
			$group = '';
			if ( $context->isBetaGroupMember() ) {
				// beta was turned off
				$schemaData['beta'] = "off";
			}
		}
		$context->setMobileMode( $group );
		$returnToTitle = Title::newFromText( $request->getText( 'returnto' ) );
		if ( $returnToTitle ) {
			$url = $returnToTitle->getFullURL();
		} else {
			$url = $this->getPageTitle()->getFullURL( 'success' );
		}
		$context->getOutput()->redirect( MobileContext::singleton()->getMobileUrl( $url ) );
	}

	/**
	 * Get the URL of this special page
	 * @param string|null $option Subpage string, or false to not use a subpage
	 * @param Title $returnTo Destination to returnto after successfully action on the page returned
	 * @param bool $fullUrl Whether to get the local url, or the full url
	 *
	 * @return string
	 */
	public static function getURL( $option, Title $returnTo = null, $fullUrl = false ) {
		$t = SpecialPage::getTitleFor( 'MobileOptions', $option );
		$params = [];
		if ( $returnTo ) {
			$params['returnto'] = $returnTo->getPrefixedText();
		}
		if ( $fullUrl ) {
			return MobileContext::singleton()->getMobileUrl( $t->getFullURL( $params ) );
		} else {
			return $t->getLocalURL( $params );
		}
	}

	public function getSubpagesForPrefixSearch() {
		return array_keys( $this->options );
	}
}
