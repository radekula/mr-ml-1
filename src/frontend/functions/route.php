<?php

require_once "token.php";
require_once "login.php";
require_once "register.php";
require_once "app.php";
require_once "404.php";

/*
 * Call function depending on request data
 */
function route($data) {
    $config = getConfig();
    $tokenValid = false;

/*
 * Checking if user is logged or trying to log
 */
    // check if user is trying to login:
    if($data['action'] == 'login' and $data['method'] == 'POST') {
        loginPOST($data, $config);
        return;
    }

    // check if user is trying to register:
    if($data['action'] == 'register' and $data['method'] == 'POST') {
        registerPOST($data, $config);
        return;
    }

    // check if user is logged:
    if(!empty($data['login']) and !empty($data['token'])) {
        $tokenValid = validateToken($data['login'], $data['token']);
    }

    // user is not logged but is trying to register so we render him a register page:
    if($tokenValid == false and $data['action'] == 'register') {
        registerGET($data, $config);
        return;
    }
    
    // user is not logged and not trying to login so we render him a login page:
    if($tokenValid == false) {
        loginGET($data, $config);
        return;
    }

/*
 * User is logged
 */
    // if user is logged and trying to login or register again we redirect him to main page:
    if($data['action'] == 'login' or $data['action'] == 'register') {
        redirectTo('/');
        return;
    }

    // handle requests:
    switch($data['action']) {
        case "desktop":
            renderDesktop($data, $config);
            break;
        case "service":
            $ret = callService($data, $config);

            header('HTTP/1.1 ' . $ret['status']);
            print $ret['body'];
            break;
        case "logout":
            renderLogout($data, $config);
            break;
        default:
            render404($data, $config);
            break;
    }
}
