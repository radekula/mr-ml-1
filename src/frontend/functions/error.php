<?php
 
/*
 * Redirect to 404 page
 */
header('HTTP/1.1 301 Moved Permanently');
header('Location: /404');
exit();
