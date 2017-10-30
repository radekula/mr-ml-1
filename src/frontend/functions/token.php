<?php

function validateToken($user, $token) {
    $valid = False;
    
    $url = $config['users']['url'] 
           . '/user/'
           . $user . '/'
           . $token;

    $ret = remoteCall($url, 'GET', null);

    // user can get data about himself so his token is valid
    if($ret['status'] == 200) {
        $valid = True;
    }

    return $valid;
}
