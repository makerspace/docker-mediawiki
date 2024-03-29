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

$wgGenerateThumbnailOnParse = true;
wfLoadSkin( 'MinervaNeue' );


// ENABLE for debugging
#$wgShowExceptionDetails = true;
#$wgShowDBErrorBacktrace = true;
#$wgShowSQLErrors = true;

wfLoadExtension('MobileFrontend');
$wgMFAutodetectMobileView = true;
# $wgMFDefaultSkinClass = 'SkinMinerva'; // use Minerva skin

if (false && getenv('NETWORKAUTH_IPRANGE') != '') {
	require_once "$IP/extensions/NetworkAuth/NetworkAuth.php";
	$wgNetworkAuthUsers[] = [
	'iprange' => [ getenv('NETWORKAUTH_IPRANGE') ],
	'user'    => getenv('NETWORKAUTH_USER'),
	];
	$wgNetworkAuthSpecialUsers[] = getenv('NETWORKAUTH_USER');
}

#if (false && getenv('RECAPTCHA_SITE_KEY') != '') {
#	wfLoadExtensions([ 'ConfirmEdit', 'ConfirmEdit/ReCaptchaNoCaptcha' ]);
#	$wgCaptchaClass = 'ReCaptchaNoCaptcha';
#	$wgReCaptchaSiteKey = getenv('RECAPTCHA_SITE_KEY');
#	$wgReCaptchaSecretKey = getenv('RECAPTCHA_SECRET_KEY');
#}

wfLoadExtensions([ 'ConfirmEdit', 'ConfirmEdit/QuestyCaptcha' ]);
$wgCaptchaQuestions = [
	'In which city is this makerspace based?' => 'Stockholm',
	'Which country is this makerspace based in?' => 'Sweden',
];


$wgUsePrivateIPs = true;
$wgSquidServersNoPurge = array('172.17.0.4');

wfLoadExtension('CategoryTree');
wfLoadExtension('StopForumSpam');

