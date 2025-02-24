<?php

error_reporting(-1);
ini_set("display_errors", "1");
ini_set("log_errors", 1);

// Include the database connection file
require "DBConnection.php";
$inData = getRequestInfo();

// Ensure required fields exist
if (!isset($inData["userId"], $inData["firstName"]) && (!isset($inData["phoneNumber"]) || !isset($inData["email"]))) {
    returnWithError("MissingFieldsError", "Required fields are missing. (First Name and (Phone Number or Email))", 400);
    exit();
}

$userId = $inData["userId"];
$firstName = $inData["firstName"];

if (!isset($inData["lastName"]) || trim($inData["lastName"] === ""))
    $lastName = "";
else
    $lastName = $inData["lastName"];

if (!isset($inData["phoneNumber"]) || trim($inData["phoneNumber"]) === "")
    $phoneNumber = "";
else
    $phoneNumber = $inData["phoneNumber"];

if (!isset($inData["email"]) || trim($inData["email"]) === "")
    $email = "";
else
    $email = $inData["email"];

// Prepare SQL query to insert the contact
$stmt = $conn->prepare("INSERT INTO Contacts (UserID, FirstName, LastName, PhoneNumber, Email) VALUES (?, ?, ?, ?, ?)");
$stmt->bind_param("issss", $userId, $firstName, $lastName, $phoneNumber, $email);

if ($stmt->execute()) {
    $getContact = $conn->prepare("SELECT ID, FirstName, LastName, PhoneNumber, Email FROM Contacts WHERE UserID=? AND FirstName=? AND LastName=? AND PhoneNumber=? AND Email=?");
    $getContact->bind_param("issss", $userId, $firstName, $lastName, $phoneNumber, $email);
    $getContact->execute();
    $result = $getContact->get_result();
    if ($row = $result->fetch_assoc()) {
        returnWithInfo($row["ID"], $row["FirstName"], $row["LastName"], $row["PhoneNumber"], $row["Email"]);
    }
} else {
    returnWithError("DatabaseError", "Failed to add the contact.", 500);
}

$stmt->close();
$conn->close();

// Helper function to retrieve JSON input
function getRequestInfo() {
    return json_decode(file_get_contents("php://input"), true);
}

function returnWithError($err, $message, $code) {
    $returnArray = array("error" => $err, "message" => $message);
    header("Content-type: application/json; charset=utf-8");
    http_response_code($code);
    echo json_encode($returnArray);
}

function returnWithInfo($id, $firstName, $lastName, $phoneNumber, $email) {
    $returnArray = array(
        "contactId" => $id,
        "firstName" => $firstName,
        "lastName" => $lastName,
        "phoneNumber" => $phoneNumber,
        "email" => $email
    );
    header("Content-type: application/json; charset=utf-8");
    http_response_code(200);
    echo json_encode($returnArray);
}

?>
