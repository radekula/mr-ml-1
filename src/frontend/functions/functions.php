<?php

require_once "route.php";
require_once "services.php";

/*
 * Get application configuration
 */
function getConfig() {
    $config = parse_ini_file("config/config.ini", true);

    return $config;
}

/*
 * Decode URI to be more readable
 */
function decodeRequestUri($uri) {
    return rawurldecode(htmlspecialchars($uri, ENT_QUOTES, 'UTF-8'));
}

/*
 * Get all request data in one structure
 */
function getRequestData() {
    $data = [];
    $data['method'] = $_SERVER['REQUEST_METHOD'];
    $data['url'] = decodeRequestUri($_SERVER['REQUEST_URI']);

    $uri_parts = parse_url($data['url']);
    $path_parts = explode('/', $uri_parts['path']);

    // get parts from path
    foreach($path_parts as $idx => $param) {
        if($idx == 1) {
            $data['action'] = !empty($param) ? $param : "desktop";
        }
        
        if($idx > 1) {
            $data['params'][$idx - 2] = $param;
        }
    }

    // fill params with _GET data
    if(!empty($data['params_get'])) {
        $data['params_get'] = array_merge($data['params_get'], $_GET);
    } else {
        $data['params_get'] = $_GET;
    };

    // get login and token
    if(empty($_COOKIE['token'])) {
        $data['login'] = '';
        $data['token'] = '';
    } else {
        $data['login'] = $_COOKIE['login'];
        $data['token'] = $_COOKIE['token'];
    }

    // get body data (POST, PUT)
    $data['body'] = file_get_contents('php://input');

    return $data;
}

/*
 * Call remote server
 */
function remoteCall($url, $method, $body) {
    $ret = [];
    $ret['status'] = null;
    $ret['body'] = null;
    $options = array();
    
    $ch = curl_init( $url );
    $options = array(
        CURLOPT_RETURNTRANSFER => true
    );
    
    if($method == 'POST' || $method == 'PUT') {
        $options = array(
            CURLOPT_RETURNTRANSFER => true,
			CURLOPT_CUSTOMREQUEST => $method,
            CURLOPT_HTTPHEADER => array( 'Content-type: application/json' ),
            CURLOPT_POSTFIELDS => $body,
            CURLOPT_HEADER => 0
        );
    }
    
    if($method == 'DELETE') {
        $options = array(
            CURLOPT_CUSTOMREQUEST => 'DELETE'
        );
    }
    
    curl_setopt_array( $ch, $options );
    $result = curl_exec( $ch );
    $http_code = curl_getinfo( $ch, CURLINFO_HTTP_CODE );
    
    $ret['status'] = $http_code;
    $ret['body'] = $result != false ? $result : null;
    
    curl_close($ch);
    return $ret;
}

/*
 * Redirect to different url
 */
function redirectTo($url) {
    header('HTTP/1.1 301 Moved Permanently');
    header('Location: ' . $url);
}

function callService($data, $config) {
    $serviceName = $data['params'][0];

    switch($serviceName) {
        case "users":
            return callUsers($data, $config);
            break;
        case "documents":
            return callDocuments($data, $config);
            break;
        case "groups":
            return callGroups($data, $config);
            break;
        case "flows":
            return callFlows($data, $config);
            break;
        case "flows-documents":
            return callFlowsDocuments($data, $config);
            break;
        case "desktop":
            return callDesktop($data, $config);
            break;
        case "signing":
            return callSigning($data, $config);
            break;
        default:
            render404($data, $config);
            break;
    }
}

function addCookie($name, $value) {
    setcookie($name, $value, time()+60*60*24*365, '/');
}

function removeCookie($name) {
    unset($_COOKIE[$name]);
    setcookie($name, '', time() - 3600, '/');
}

function genUUID() {
    $uuid = uuid_create();
    
    return $uuid;
}
