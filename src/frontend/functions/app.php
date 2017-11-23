<?php


/*
 * Render main page for app
 */
function renderDesktop($data, $config) {
    $html = file_get_contents(__DIR__ . "/../www/app.html");

    print $html;
}
