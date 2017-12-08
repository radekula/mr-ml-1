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




/*
 * Call flows service
 */
function callFlows($data, $config) {
    $remoteUrl = $config['service']['flows'] . '/' . $data['params'][1];
    $method = $data['method'];

    if(isset($data['params'][3])) {
        if($data['params'][3] == "step" or $data['params'][3] == "steps") {
            $data['params'][1] = $data['params'][3];
        }
    }
    switch($data['params'][1]) {
        case "flows":
            $remoteUrl .= '/' . $data['token'];
            break;
        case "flow":
            $remoteUrl .= '/' . $data['params'][2] . '/' . $data['token'];
            break;
        case "steps":
            $remoteUrl .= '/' . $data['params'][2] . '/steps/' . $data['token'];
            break;
        case "step":
            $remoteUrl .= '/' . $data['params'][2] . '/step/' . $data['params'][4] . '/' . $data['token'];
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
 * Call flows-documents service
 */
function callFlowsDocuments($data, $config) {
    $remoteUrl = $config['service']['flows_documents'] . '/' . $data['params'][1];
    $method = $data['method'];

    switch($data['params'][1]) {
        case "start":
            $remoteUrl .= '/' . $data['token'];
            break;
        case "status":
            $remoteUrl .= '/' . $data['params'][2] . '/' . $data['token'];
            break;
        case "action":
            $remoteUrl .= '/' . $data['params'][2] . '/' . $data['params'][3] . $data['token'];
            break;
        case "force":
            $remoteUrl .= '/' . $data['params'][2] . '/' . $data['params'][3] . $data['token'];
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
