<?php

require_once "functions.php";


/*
 * Call users service
 */
function callUsers($data, $config) {
    $remoteUrl = $config['service']['users'] . '/' . $data['params'][1];
    $method = $data['method'];

    switch($data['params'][1]) {
        case "users":
            $remoteUrl .= '/' . $data['token'];
            break;
        case "user":
            $remoteUrl .= '/' . $data['login'] . '/' . $data['token'];
            break;
        case "login":
            $remoteUrl .= '/' . !empty($data['login']) ? $data['login'] : $data['params'][2];
            break;
        case "logout":
            $remoteUrl .= '/' . $data['token'];
            break;
        case "change_password":
            $remoteUrl .= '/' . $data['login'] . '/' . $data['token'];
            break;
        case "verify":
            $remoteUrl .= '/' . $data['token'];
            break;
    }

    if(isset($data['params_get'])) {
        $getParams = [];
        
        foreach($data['params_get'] as $key => $value) {
            $getParams[] = $key . '=' . $value;
        }
        $remoteParams = implode('&', $getParams);
    };

    if(!empty($remoteParams)) {
        $remoteUrl .= '?' . $remoteParams;
    }

    $ret = remoteCall($remoteUrl, $method, $data['body']);

    return $ret;
}


/*
 * Call documents service
 */
function callDocuments($data, $config) {
    $remoteUrl = $config['service']['documents'] . '/' . $data['params'][1];
    $method = $data['method'];

    switch($data['params'][1]) {
        case "documents":
            $remoteUrl .= '/' . $data['token'];
            break;
        case "document":
            $remoteUrl .= '/' . $data['params'][2] . '/' . $data['token'];
            break;
    }

    if(isset($data['params_get'])) {
        $getParams = [];
        
        foreach($data['params_get'] as $key => $value) {
            $getParams[] = $key . '=' . $value;
        }
        $remoteParams = implode('&', $getParams);
    };

    if(!empty($remoteParams)) {
        $remoteUrl .= '?' . $remoteParams;
    }

    $ret = remoteCall($remoteUrl, $method, $data['body']);
    return $ret;
}




/*
 * Call groups service
 */
function callGroups($data, $config) {
    $remoteUrl = $config['service']['groups'] . '/' . $data['params'][1];
    $method = $data['method'];

    switch($data['params'][1]) {
        case "groups":
            $remoteUrl .= '/' . $data['token'];
            break;
        case "group":
            $remoteUrl .= '/' . $data['params'][2] . '/' . $data['token'];
            break;
        case "members":
            $remoteUrl .= '/' . $data['params'][2] . '/' . $data['params'][3] . '/' . $data['token'];
            break;
        case "user":
            $remoteUrl .= '/' . $data['login'] . '/' . $data['params'][2] . '/' . $data['token'];
            break;
    }

    if(isset($data['params_get'])) {
        $getParams = [];
        
        foreach($data['params_get'] as $key => $value) {
            $getParams[] = $key . '=' . $value;
        }
        $remoteParams = implode('&', $getParams);
    };

    if(!empty($remoteParams)) {
        $remoteUrl .= '?' . $remoteParams;
    }

    $ret = remoteCall($remoteUrl, $method, $data['body']);
    return $ret;
}
