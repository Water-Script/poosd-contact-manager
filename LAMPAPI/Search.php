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
        break;
    case "firstname":
        $searchStr = "UserID=" . $userID . " AND " . "FirstName='" . $search . "'";
        echo $searchStr;
        break;
    case "lastname":
        $searchStr = "UserID=" . $userID . " AND " . "LastName='" . $search . "'";
        break;
    case "phonenumber":
        $searchStr = "UserID=" . $userID . " AND " . "PhoneNumber='" . $search . "'";
        break;
    case "email":
        $searchStr = "UserID=" . $userID . " AND " . "Email='" . $search . "'";
        break;
    default:
        returnWithError("IncorrectSearchTypeError", "The chosen search type is invalid.", 400);
        break;
}

function searchDB($conn, $searchStr) {
    $searchContact = $conn->prepare("SELECT FirstName, LastName, PhoneNumber, Email FROM Contacts WHERE ?");
    $searchContact->bind_param("s", $searchStr);
    if ($searchContact->execute()) {
        if ($result = $searchContact->get_result()) {
            $contacts = array();
            while ($row = $result->fetch_assoc()) {
                $array_push($contacts, array($row["FirstName"], $row["LastName"], $row["PhoneNumber"], $row["Email"]));
                // each contact needs to be added to an array "contacts" with variables for each field
                /* 
                {
                    "contacts": [
                    {
                        "userID": 12
                        "firstname": "bob"
                        "lastname": "someone"
                        "phonenum": 1234567890
                        "email": bob@gmail.com
                    }
                    ]
                }
                */
                // then return said contacts array.
                returnWithInfo($contacts);
            }
        }
        else {
            returnWithError("ContactNotFoundError", "The requested contact could not be found.", 404);
        }
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
    $returnArray = array(
        "contacts" => $contacts
    );
    header("Content-type: application/json; charset=utf-8");
    http_response_code(200);
    echo json_encode($returnArray);
}

?>