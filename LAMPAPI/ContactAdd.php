<?php
    require 'DBConnection.php';

    $inData = getRequestInfo();

    function getRequestInfo() {
        return json_decode(file_get_contents('php://input'), true);
    }
?>