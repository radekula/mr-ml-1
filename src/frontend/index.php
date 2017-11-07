<?php

require "./functions/functions.php";

// Get request data
$data = getRequestData();

/*
 * Call route function to handle all request according to URI
 */ 
route($data);
