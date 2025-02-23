<?php

error_reporting(-1);
ini_set("display_errors", "1");
ini_set("log_errors", 1); // Report errors in console if it occurs

require "DBConnection.php";

$inData = getRequestInfo();

$userId = $inData["userId"];
$contactId = $inData["contactId"];
$firstName = $inData["firstName"];
$lastName = $inData["lastName"];
$phoneNumber = $inData["phoneNumber"];
$email = $inData["email"];

if (empty($userId) || empty($contactId)) {
    returnWithError("MalformedRequestError", "The user and contact IDs must be valid numbers.", 400);
    exit();
}

$checkContact = $conn->prepare("SELECT * FROM Contacts WHERE UserID=? AND ID=?");
$checkContact->bind_param("i", $userId, $contactId);
if ($checkContact->execute()) {
    $result = $checkContact->get_result();
    if ($row = $result->fetch_assoc()) {
        if (!isset($firstName) || trim($firstName) === "") {
            $firstName = $row["FirstName"];
        }
        if (!isset($lastName) || trim($lastName) === "") {
            $lastName = $row["LastName"];
        }
        if (!isset($phoneNumber) || trim($phoneNumber) === "") {
            $phoneNumber = $row["PhoneNumber"];
        }
        if (!isset($email) || trim($email) === "") {
            $email = $row["Email"];
        }

        if ($firstName === $row["FirstName"] && $lastName === $row["LastName"] && $email === $row["Email"] && $phoneNumber === $row["PhoneNumber"]) {
            returnWithError("NoChangesError", "There are no changes to be made on this contact.", 400);
            exit();
        }
        else {
            $updateContact = $conn->prepare("UPDATE Contacts SET FirstName=?, LastName=?, PhoneNumber=?, Email=? WHERE ID=?");
            $updateContact->bind_param("ssssi", $firstName, $lastName, $phoneNumber, $email, $contactId);
            if ($updateContact->execute()) {
                if ($updateContact->affected_rows > 0) {
                    returnWithInfo($userId, $contactId, $firstName, $lastName, $email, $phoneNumber);
                } else {
                    returnWithError("DatabaseError", "Something went wrong when updating the contact.", 500);
                }
            }
        }
    }
    else {
        returnWithError("NoContactFoundError", "There was no contact with this ID.", 404);
        exit();
    }
}

function getRequestInfo() {
    return json_decode(file_get_contents("php://input"), true);
}

function returnWithInfo($userId, $contactId, $firstName, $lastName, $email, $phoneNumber) {
    $returnArray = array(
        "userId" => $userId,
        "contactId" => $contactId,
        "firstName" => $firstName,
        "lastName" => $lastName,
        "email" => $email,
        "phoneNumber" => $phoneNumber
    );
    header("Content-type: application/json; charset=utf-8");
    http_response_code(200);
    echo json_encode($returnArray);
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

?>