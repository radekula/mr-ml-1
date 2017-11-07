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
	$data['action'] = $_GET['action'];
	$data['method'] = $_SERVER['REQUEST_METHOD'];
	$data['url'] = decodeRequestUri($_SERVER['REQUEST_URI']);

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
	parse_str($body, $data['body']);
	
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
			CURLOPT_HTTPHEADER => array( 'Content-type: application/json' ),
			CURLOPT_POSTFIELDS => $body,
			CURLOPT_HEADER => 0
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

function redirectTo($url) {
	header('HTTP/1.1 301 Moved Permanently');
	header('Location: ' . $url);
	exit();
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