<?php

/*
 * Render page for login
 */
function getLoginGET($data, $config, $status = '') {
    $html = file_get_contents(__DIR__ . "/../www/login.html");
    $html = str_replace("{{login_url}}", $config['login']['url'], $html);
    $html = str_replace("{{register_url}}", $config['register']['url'], $html);
    
    echo $status;
    
    if(!empty($status)) {
        $html = str_replace('{{alert.class}}', 'alert-danger', $html);
        $html = str_replace('{{alert.content}}', $config['login'][$status], $html);
    }
    
    else if(isset($_COOKIE['alert'])) {
        $html = str_replace('{{alert.class}}', 'alert-success', $html);
        $html = str_replace('{{alert.content}}', htmlspecialchars($_COOKIE['alert']), $html);
        removeCookie('alert');
    }
    
    else if(isset($_COOKIE['alert_danger'])) {
        $html = str_replace('{{alert.class}}', 'alert-danger', $html);
        $html = str_replace('{{alert.content}}', htmlspecialchars($_COOKIE['alert_danger']), $html);
        removeCookie('alert_danger');
    }
    
    else {
        $html = str_replace('{{alert.class}}', '', $html);
        $html = str_replace('{{alert.content}}', '', $html);
    } 
    
    print $html;
}

/*
 * Login user
 */
function getLoginPOST($data, $config) {
    $loginData = $data['body'];
    
    $url = $config['server']['users_url'] . '/login/' . $data['body']['login'];
    $ret = remoteCall($url, 'POST', json_encode($loginData));
    
    if($ret['status'] == 200) {
        $tokenData = json_decode($ret['body'], true);
        setcookie('login', $data['body']['login'], time()+60*60*24*365, '/');
        setcookie('token', $tokenData['token'], time()+60*60*24*365, '/');
        
        redirectTo($config['server']['base_url']);
    }
    
    getLoginGET($data, $config, $ret['status']);
}

/*
 * Handle /login requests
 */
function renderLogin($data, $config) {
    if( !empty($data['login']) and
        !empty($data['token'])
    ) {
        $tokenValid = validateToken($data['login'], $data['token']);
        
        if($tokenValid) {
            // User is login in
            redirectTo($config['server']['base_url']);
        }
    }
    
    switch($data['method']) {
        case 'GET':
            getLoginGET($data, $config);
            break;
        case 'POST':
            getLoginPOST($data, $config);
            break;
    }
}

/*
 * Logout
 */
function getLogout($data, $config) {
    $loginData = $data['body'];
    $url = $config['logout']['url'] . '/' . $data['token'];
    $ret = remoteCall($url, 'GET', null);
    
    if($ret['status'] == 200) {
        removeCookie('login');
        removeCookie('token');
        addCookie('alert', $config['logout']['200']);
    }
    
    else if($ret['status'] == 403) {
        addCookie('alert_danger', $config['logout']['403']);
    }
    
    else if($ret['status'] == 500) {
        addCookie('alert_danger', $config['logout']['500']);
    }
    
    echo '<meta http-equiv="REFRESH" content="0;url=' . $config['login']['url'] . '">';
    return;
}

/*
 * Handle /logout requests
 */
function renderLogout($data, $config) {
    if( !empty($data['login']) and
        !empty($data['token'])
    ) {
        $tokenValid = validateToken($data['login'], $data['token']);

        if($tokenValid) {
            // User is login in
            switch($data['method']) {
                case 'GET':
                    getLogout($data, $config);
                    break;
            }
        }
    }
    
    else {
        // User is not login in
        redirectTo($config['server']['base_url']);
    }
}
