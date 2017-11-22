<?php

/*
 * Render page for app
 */
function getAppGET($data, $config) {
    $html = file_get_contents(__DIR__ . "/../www/angular/documents.html");

    print $html;
}

/*
 * Handle / requests
 */
function renderApp($data, $config) {
    if(!empty($data['login']) and !empty($data['token'])) {
        $tokenValid = validateToken($data['login'], $data['token']);

        if($tokenValid == true) {
            // User is login in
            getAppGET($data, $config);
        } else {
            // Token is not valid
            redirectTo($config['login']['url']);
        }
    } else {
        // User is not login in
        redirectTo($config['login']['url']);
    }
}
