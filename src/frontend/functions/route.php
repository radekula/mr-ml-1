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

    switch($data['action']) {
        case "login":
            renderLogin($data, $config);
            break;
        case "logout":
            renderLogout($data, $config);
            break;
        case "register":
            renderRegister($data, $config);
            break;
        case "app":
            renderApp($data, $config);
            break;
        case "404":
            render404($config);
            break;
        default:
            renderApp($data, $config);
            break;
    }
}
