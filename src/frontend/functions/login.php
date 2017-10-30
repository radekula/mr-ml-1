<?php

/*
 * Render page for login
 */
function getLoginGET($data, $config, $return_url = '/') {
    $html = file_get_contents(__DIR__ . "/../www/login.html");
    $html = str_replace("{base_url}", $config['server']['base_url'], $html);
    
    print $html;
}


/*
 * Login user
 */
function getLoginPOST($data, $config) {
    $loginData = $data['body'];

    $url = $config['users']['url'] 
           . '/login/'
           . $data['params'][0];

    $ret = remoteCall($url, 'POST', json_encode($loginData));

    if($ret['status'] == 200) {
        $tokenData = json_decode($ret['body'], true);

        setcookie('login', $data['params'][0]);
        setcookie('token', $tokenData['token']);
    }
    
    http_response_code((int) $ret['status']);
}


/*
 * Handle /login requests
 */
function renderLogin($data, $config, $return_url = '/') {
    if(!empty($data['token'])) {
        $tokenValid = validateToken($data['token']);

        if($tokenValid) {
            getAlreadyLogged($data, $config);
            return;
        }
    }

    switch($data['method']) {
        case 'GET':
            getLoginGET($data, $config, $return_url);
            break;
        case 'POST':
            getLoginPOST($data, $config);
            break;
        default:
            http_response_code(400);
            break;
    }
}



/*
 * Logout
 */
function getLogout($data, $config) {
    $loginData = $data['body'];

    $url = $config['users']['url'] 
           . '/logout/'
           . $data['token'];

    $ret = remoteCall($url, 'GET', null);

    http_response_code((int) $ret['status']);
}


/*
 * Handle /logout requests
 */
function renderLogout($data, $config) {
    $tokenValid = validateToken($data['token']);

    if($tokenValid) {
        redirectToLogin($data, $config);
        return;
    }

    switch($data['method']) {
        case 'GET':
            getLogout($data, $config);
            break;
        default:
            http_response_code(400);
            break;
    }
}


function redirectToLogin($params, $config, $return_url = '/') {
// TODO
/*    $html = file_get_contents(__DIR__ . "/../www/login.html");
    $html = str_replace("{base_url}", $config['server']['base_url'], $html);
    
    print $html;*/
}
