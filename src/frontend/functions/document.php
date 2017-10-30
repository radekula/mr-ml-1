<?php



/*
 * Render page for adding new document
 */
function addDocumentGET($data, $config) {
    $html = file_get_contents(__DIR__ . "/../www/add.html");
    $html = str_replace("{base_url}", $config['server']['base_url'], $html);

    print $html;
}



/*
 * Get document
 */
function getDocumentGET($data, $config) {
    $url = $config['documents']['url'] 
           . '/document/'
           . $data['params'][1];

    $ret = remoteCall($url, 'GET', null);

    if($ret['status'] != 200) {
        http_response_code((int) $ret['status']);
        return;
    }

    print $ret['body'];
}


/*
 * Add document
 */
function addDocumentPOST($data, $config) {
    $document = $data['body'];
    if(empty($document['id'])) {
        $document['id'] = genUUID();
    }

    $url = $config['documents']['url'] 
           . '/document/'
           . $document['id'];

    $ret = remoteCall($url, 'PUT', json_encode($document));

    http_response_code((int) $ret['status']);
}


/*
 * Update document
 */
function updateDocumentPOST($data, $config) {
    $document = $data['body'];

    $url = $config['documents']['url'] 
           . '/document/'
           . $document['id'];

    $ret = remoteCall($url, 'POST', json_encode($document));

    http_response_code((int) $ret['status']);
}


/*
 * Delete document from system
 */
function deleteDocumentGET($data, $config) {
    $document = $data['body'];

    $url = $config['documents']['url'] 
           . '/document/'
           . $document['id'];

    $ret = remoteCall($url, 'DELETE', null);

    http_response_code((int) $ret['status']);
}


/*
 * Handle /document requests
 */
function renderDocument($data, $config) {
    $tokenValid = validateToken($data['token']);

    if(!$tokenValid) {
        redirectToLogin($data, $config);
        return;
    }

    switch($data['params'][0]) {
        case 'get':
            switch($data['method']) {
                case "GET":
                    getDocumentGET($data, $config);
                    break;
                default:
                    http_response_code(400);
                    break;
            }
            break;
        case 'add':
            switch($data['method']) {
                case "GET":
                    addDocumentGET($data, $config);
                    break;
                case "POST":
                    addDocumentPOST($data, $config);
                    break;
                default:
                    http_response_code(400);
                    break;
            }
            break;
        case 'update':
            switch($data['method']) {
                case "POST":
                    updateDocumentPOST($data, $config);
                    break;
                default:
                    http_response_code(400);
                    break;
            }
            break;
        case 'delete':
            switch($data['method']) {
                case "GET":
                    deleteDocumentPOST($data, $config);
                    break;
                default:
                    http_response_code(400);
                    break;
            }
            break;
        default:
            http_response_code(400);
            break;
    }
}

