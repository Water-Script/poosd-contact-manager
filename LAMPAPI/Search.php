<?php

error_reporting(-1);
ini_set("display_errors", "1");
ini_set("log_errors", 1); // Report errors in console if it occurs

require "DBConnection.php";

$userID = $_GET["userId"];
$type = $_GET["type"];
$search = $_GET["search"];

switch ($type) {
    case "getAll":
        $searchStr = "UserID=" . $userID;
        searchDB($conn, $searchStr);
        break;
    case "firstname":
        $searchStr = "UserID=" . $userID . " AND " . "FirstName='" . $search . "'";
        searchDB($conn, $searchStr);
        break;
    case "lastname":
        $searchStr = "UserID=" . $userID . " AND " . "LastName='" . $search . "'";
        searchDB($conn, $searchStr);
        break;
    case "phonenumber":
        $searchStr = "UserID=" . $userID . " AND " . "PhoneNumber='" . $search . "'";
        searchDB($conn, $searchStr);
        break;
    case "email":
        $searchStr = "UserID=" . $userID . " AND " . "Email='" . $search . "'";
        searchDB($conn, $searchStr);
        break;
    default:
        returnWithError("InvalidSearchTypeError", "The chosen search type is invalid.", 400);
        break;
}

function searchDB($conn, $searchStr) {
    $query = "SELECT ID, FirstName, LastName, PhoneNumber, Email FROM Contacts WHERE " . $searchStr;
    $result = $conn->query($query);
    if ($result) {
        if ($result->num_rows > 0) {
            $contacts = array();
            while ($row = $result->fetch_assoc()) {
                $contacts[] = $row;
            }
            returnWithInfo($contacts);
        }
        else {
            returnWithError("ContactNotFoundError", "The requested contact(s) could not be found.", 404);
        }
    }
    else {
        returnWithError("InternalServerError", "The server has encountered an internal error during the processing of the request.");
    }
}

function returnWithError($err, $message, $code) {
    $returnArray = array(
        "error" => $err,
        "message" => $message
    );
    header("Content-type: application/json; charset=utf-8");
    http_response_code($code);
    echo json_encode($returnArray);
}

function returnWithInfo($contacts) {
    header("Content-type: application/json; charset=utf-8");
    http_response_code(200);
    echo json_encode(["contacts" => $contacts]);
}
?>