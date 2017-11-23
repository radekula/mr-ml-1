<?php

/*
 * Render page for login
 */
function loginGET($data, $config, $status = '') {
    $html = file_get_contents(__DIR__ . "/../www/login.html");
        
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
function loginPOST($data, $config) {
    $loginData = $data['body'];

    $url = $config['service']['users'] . '/login/' . $data['body']['login'];
    $ret = remoteCall($url, 'POST', json_encode($loginData));

    if($ret['status'] == 200) {
        $tokenData = json_decode($ret['body'], true);
        setcookie('login', $data['body']['login'], time()+60*60*24*365, '/');
        setcookie('token', $tokenData['token'], time()+60*60*24*365, '/');
        
        redirectTo('/');
    }
}



/*
 * Logout user
 */
function renderLogout($data, $config) {
    if($data['method'] == 'GET') {
        $url = $config['service']['users'] . '/logout/' . $data['token'];
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
        
        echo '<meta http-equiv="REFRESH" content="0;url=' . '/login' . '">';
    } else {
        renderInvalidRequest($data, $config);
    }
}
