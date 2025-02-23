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

if (empty($userId)) {
    returnWithError("NoUserIDError", "There was no user selected for this contact.", 400);
    exit();
}

if (empty($contactId)) {
        returnWithError("NoContactIDError", "There was no contact selected.", 400);
        exit();
}

$checkContact = $conn->prepare("SELECT * FROM Contacts WHERE ID=?");
$checkContact->bind_param("i", $userId);
if ($checkContact->execute()) {
    $result = $checkContact->get_result();
    if ($row = $result->fetch_assoc()) {
        if (empty($firstName) || $firstName === " ") {
            $firstName = $row["FirstName"];
        }
        if (empty($lastName) || $lastName === " ") {
            $lastName = $row["LastName"];
        }
        if (empty($phoneNumber) || $phoneNumber === " ") {
            $phoneNumber = $row["PhoneNumber"];
        }
        if (empty($email) || $email === " ") {
            $email = $row["Email"];
        }

        if ($firstName === $row["FirstName"] && $lastName === $row["LastName"] && $email === $row["Email"] && $phoneNumber === $row["PhoneNumber"]) {
            returnWithError("NoChangesError", "There are no changes to be made on this contact.", 400);
            exit();
        }
        else {
            $checkContact->close();
            $stmt = "FirstName=?, LastName=?, PhoneNumber=?, Email=?";
            $updateContact = $conn->prepare("UPDATE Contacts SET " . $stmt . " WHERE ID=?");
            $updateContact->bind_param("ssssi", $firstName, $lastName, $phoneNumber, $email, $contactId);
            if ($updateContact->execute()) {
                $result = $checkContact->get_result();
                if ($row = $result->fetch_assoc()) {
                    returnWithInfo($userId, $contactId, $firstName, $lastName, $email, $phoneNumber);
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