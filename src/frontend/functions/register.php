<?php

/*
 * Render page for register
 */
function registerGET($data, $config, $status = '', $notice = array()) {
    $html = file_get_contents(__DIR__ . '/../www/register.html');

    $dataBody = null;

    // Setting the value of the attribute "value"
    if (array_key_exists('body', $data)) {
        $dataBody = $data['body'];
    }

    if(is_array($dataBody) and count($dataBody) > 0) {
        foreach($dataBody as $key=>$item) {
            $html = str_replace('{{' . $key . '}}', $item, $html);
        }
    }
    else {
        $registerNotice = $config['register_notice'];
        if(is_array($registerNotice)) {
            foreach($registerNotice as $key=>$item) {
                $html = str_replace('{{' . $key . '}}', '', $html);
            }
        }
    }
    
    // Display error messages
    if(count($notice) > 0) {
        foreach($notice as $key=>$item) {
            $html = str_replace($item, $config['register_notice'][$key], $html);
            $html = str_replace('{{class_' . $key . '}}', 'input-danger', $html);
        }
    }
    
    foreach($config['register_notice'] as $key=>$item) {
        $html = str_replace('{{notice_' . $key . '}}', '', $html);
        
        if(is_array($dataBody) and
           count($dataBody) > 0
        ) {
            $html = str_replace('{{class_' . $key . '}}', 'input-success', $html);
        } else {
            $html = str_replace('{{class_' . $key . '}}', '', $html);
        }
    }
    
    // Display alert after send form
    if(!empty($status)) {
        if($status == 200) {
            $html = str_replace('{{alert.class}}', 'alert-success', $html);
        } else {
            $html = str_replace('{{alert.class}}', 'alert-danger', $html);
        }
        
        $html = str_replace('{{alert.content}}', $config['register'][$status], $html);
    }
    
    else {
        $html = str_replace('{{alert.class}}', '', $html);
        $html = str_replace('{{alert.content}}', '', $html);
    }
    
    print $html;
}

/*
 * Register user
 */
function registerPOST($data, $config) {
    $loginData = null;
    $notice = [];
    parse_str($data['body'], $loginData);

    $regex = $config['register_regex'];

    if(is_array($regex)){
        foreach($regex as $key=>$item) {
            if(!preg_match('#' . $item . '#', $loginData[$key])){
                $notice[$key] = '{{notice_' . $key . '}}';
            }
        }
    }
    
    if(count($notice) > 0) {
        registerGET($data, $config, '', $notice);
        return;
    }
    
    $token = getRegisterToken($data, $config);
    $url = $config['service']['users'] . '/user/' . $loginData['login'] . '/'. $token;
    $ret = remoteCall($url, 'POST', json_encode($loginData));
    
    registerGET(array(), $config, $ret['status']);
}


/*
 * Returns the token needed for registration
 */
function getRegisterToken($data, $config) {
    $loginData = array(
        'login' => 'admin',
        'password' => 'admin123'
    );
    
    $url = $config['service']['users'] . '/login/' . $loginData['login'];
    $ret = remoteCall($url, 'POST', json_encode($loginData));
    $token = !empty($ret['body']) ? json_decode( $ret['body'] )->token : null;
    
    return $token;
}
