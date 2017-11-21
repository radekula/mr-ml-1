<?php

require_once "functions.php";

function validateToken($user, $token) {
    $valid = False;
    $config = getConfig();

    $url = $config['server']['users_url'] . '/user/' . $user . '/' . $token;
    $ret = remoteCall($url, 'GET', null);

    // user can get data about himself so his token is valid
    if($ret['status'] == 200) {
        $valid = True;
    }

    return $valid;
}
