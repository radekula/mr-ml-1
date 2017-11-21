<?php

/*
 * Render page for register
 */
function getRegisterGET($data, $config, $status = '', $notice = array()) {
    $html = file_get_contents(__DIR__ . '/../www/register.html');
    $html = str_replace('{{login_url}}', $config['login']['url'], $html);
    $html = str_replace('{{register_url}}', $config['register']['url'], $html);
    
    // Setting the value of the attribute "value"
    $dataBody = $data['body'];
    if(is_array($dataBody) and
       count($dataBody) > 0
    ) {
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
function getRegisterPOST($data, $config) {
    $loginData = $data['body'];
    $regex = $config['register_regex'];
    
    if(is_array($regex)){
        foreach($regex as $key=>$item) {
            if(!preg_match('#' . $item . '#', $data['body'][$key])){
                $notice[$key] = '{{notice_' . $key . '}}';
            }
        }
    }
    
    if(count($notice) > 0) {
        getRegisterGET($data, $config, '', $notice);
        return;
    }
    
    $token = getRegisterToken($data, $config);
    $url = $config['user']['url'] . '/' . $data['body']['login'] . '/'. $token;
    $ret = remoteCall($url, 'POST', json_encode($loginData));
    
    getRegisterGET(array(), $config, $ret['status']);
}

/*
 * Handle /register requests
 */
function renderRegister($data, $config) {
    if( !empty($data['login']) and
        !empty($data['token'])
    ) {
        $tokenValid = validateToken($data['login'], $data['token']);
        
        if($tokenValid) {
            // User is login in
            redirectTo($config['server']['base_url']);
        }
    }
    
    switch($data['method']) {
        case 'GET':
            getRegisterGET($data, $config);
            break;
        case 'POST':
            getRegisterPOST($data, $config);
            break;
    }
}

/*
 * Returns the token needed for registration
 */
function getRegisterToken($data, $config) {
    $loginData = array(
        'login' => 'admin',
        'password' => 'admin123'
    );
    
    $url = $config['login']['url'] . '/' . $loginData['login'];
    $ret = remoteCall($url, 'POST', json_encode($loginData));
    $token = !empty($ret['body']) ? json_decode( $ret['body'] )->token : null;
    
    return $token;
}
