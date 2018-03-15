<?php

// @see https://www.mediawiki.org/wiki/Manual:Configuration_settings

# Protect against web entry
if ( !defined( 'MEDIAWIKI' ) ) {
    exit;
}

$wgEnotifUserTalk = false;
$wgEnotifWatchlist = false;
$wgEmailAuthentication = true;

$wgUseInstantCommons = false;

$wgAuthenticationTokenVersion = "1";

$wgGroupPermissions['*']['createaccount'] = true;
$wgGroupPermissions['*']['edit'] = false;
$wgGroupPermissions['*']['read'] = true;

## For attaching licensing metadata to pages, and displaying an
## appropriate copyright notice / icon. GNU Free Documentation
## License and Creative Commons licenses are supported so far.
#$wgRightsPage = ""; # Set to the title of a wiki page that describes your license/copyright
#$wgRightsUrl = "";
#$wgRightsText = "";
#$wgRightsIcon = "";

## Uncomment this to disable output compression
# $wgDisableOutputCompression = true;

// OPTIONAL: Enable VisualEditor's experimental code features
#$wgDefaultUserOptions['visualeditor-enable-experimental'] = 1;
$wgShowExceptionDetails = true;
#$wgMFDefaultSkinClass = 'SkinVector'; // use Vector skin
$wgMFAutodetectMobileView = true;


// ENABLE for debugging
#$wgShowExceptionDetails = true;
#$wgShowDBErrorBacktrace = true;
#$wgShowSQLErrors = true;

wfLoadExtension('MobileFrontend');
$wgGenerateThumbnailOnParse = true;
wfLoadSkin( 'MinervaNeue' );
$wgMFDefaultSkinClass = 'SkinMinerva'; // use Minerva skin

if (getenv('NETWORKAUTH_IPRANGE') != '') {
	require_once "$IP/extensions/NetworkAuth/NetworkAuth.php";
	$wgNetworkAuthUsers[] = [
	'iprange' => [ getenv('NETWORKAUTH_IPRANGE') ],
	'user'    => 'MakerspaceUser',
	];
	$wgNetworkAuthSpecialUsers[] = 'MakerspaceUser';
}

if (getenv('RECAPTCHA_SITE_KEY') != '') {
	wfLoadExtensions([ 'ConfirmEdit', 'ConfirmEdit/ReCaptchaNoCaptcha' ]);
	$wgCaptchaClass = 'ReCaptchaNoCaptcha';
	$wgReCaptchaSiteKey = getenv('RECAPTCHA_SITE_KEY');
	$wgReCaptchaSecretKey = getenv('RECAPTCHA_SECRET_KEY');
}
