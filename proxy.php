<?php
header('Access-Control-Allow-Origin: *');
header('Content-Type: application/json');

$url = 'https://docs.google.com/spreadsheets/d/e/2PACX-1vThdwJCio195NrRM4K2PttTx6XFAp9fUod6nd0hIi_JbHwYqelwYAwlZUrMDvyNBgXXDLNclvzyk2ph/pubhtml';

$ch = curl_init();
curl_setopt($ch, CURLOPT_URL, $url);
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
curl_setopt($ch, CURLOPT_FOLLOWLOCATION, true);
$response = curl_exec($ch);
curl_close($ch);

echo $response;
?> 