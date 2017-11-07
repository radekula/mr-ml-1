<?php

/*
 * Render page for app
 */
function getAppGET($data, $config) {
    $html = file_get_contents(__DIR__ . "/../www/app.html");
	
    print $html;
}

/*
 * Handle / requests
 */
function renderApp($data, $config) {
    if( ( !empty($data['login']) and
		!empty($data['token']) ) or true
	) {
		$tokenValid = validateToken($data['login'], $data['token']);
		
        if($tokenValid or true) {
			// User is login in
			getAppGET($data, $config);
        }
		
		else {
			// Token is not valid
			redirectTo($config['login']['url']);
		}
	}
	
	else {
		// User is not login in
		redirectTo($config['login']['url']);
	}
}
