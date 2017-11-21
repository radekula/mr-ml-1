<?php

/*
 * Render 404 page
 */
function render404($config) {
    header('HTTP/1.1 404 Not Found');
    $html = file_get_contents(__DIR__ . "/../www/404.html");
    $html = str_replace("{{base_url}}", $config['server']['base_url'], $html);
    
    print $html;
}
