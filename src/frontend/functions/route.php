<?php

require "token.php";
require "login.php";
require "document.php";
require "notFound.php";


/*
 * Call function depending on request data
 */
function route($data) {
    $config = getConfig();

    switch($data['object']) {
        case "/login":
            renderLogin($data, $config);
            break;
        case "/logout":
            renderLogout($params);
            break;
        case "/document":
            renderDocument($data, $config);
            break;
/*        case "/documents":
            renderDocuments($params);
            break;*/
//        case "/flow":
//            renderFlow($params);
//            break;
//        case "/flows":
//            renderFlows($params);
//            break;
//        case "/group":
//            renderGroup($params);
//            break;
//        case "/groups":
//            renderGroups($params);
//            break;
//        case "/":
//            renderDashboard($params);
//            break;
/*        case "/user":
            renderUser($params);
            break;
        case "/logout":
            renderLogout($params);
            break;
        case "/change_password":
            renderChangePassword($params);
            break;*/
        default:
            renderNotFound($data);
            break;
    }
} 
