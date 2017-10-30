<?php

require "route.php";


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
            $data['object'] = '/' . $param;
        }
        
        if($idx > 1) {
            $data['params'][$idx - 2] = $param;
        }
    }

    // fill params with _GET data
    if(!empty($data['params'])) {
        $data['params'] = array_merge($data['params'], $_GET);
    } else {
        $data['params'] = $_GET;
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
    $body = file_get_contents('php://input');
    $data['body'] = json_decode($body, true);

    return $data;
}



/*
 * Call remote server
 */
function remoteCall($url, $method, $body) {
    $ret = [];
    $ret['status'] = null;
    $ret['body'] = null;
   
    $conn = curl_init();

    curl_setopt($conn, CURLOPT_URL, $url);
    curl_setopt($conn, CURLOPT_RETURNTRANSFER, 1);

    if($method == 'POST' || $method == 'PUT') {
        curl_setopt($conn, CURLOPT_POST, 1);
        curl_setopt($conn, CURLOPT_POSTFIELDS, $body); 
        curl_setopt($conn, CURLOPT_HTTPHEADER, array('Content-Type: application/json'));
    }

    $result = curl_exec($conn);

    $code = curl_getinfo($conn, CURLINFO_HTTP_CODE);
    $ret['status'] = $code;
    if($result != False) {
        $ret['body'] = $result;
    }
 
    curl_close($conn);
    return $ret;
}



function genUUID() {
    $uuid = uuid_create();
    
    return $uuid;
}
