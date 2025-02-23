<?php

error_reporting(-1);
ini_set("display_errors", "1");
ini_set("log_errors", 1);

// Include the database connection file
require "DBConnection.php";
$inData = getRequestInfo();

// Ensure required fields exist
if (!isset($inData["userId"], $inData["firstName"], $inData["lastName"], $inData["phoneNumber"], $inData["email"])) {
    returnWithError("MissingFieldsError", "Required fields are missing.", 400);
    exit();
}

$userId = $inData["userId"];
$firstName = $inData["firstName"];
$lastName = $inData["lastName"];
$phoneNumber = $inData["phoneNumber"];
$email = $inData["email"];

// Prepare SQL query to insert the contact
$stmt = $conn->prepare("INSERT INTO Contacts (UserID, FirstName, LastName, PhoneNumber, Email) VALUES (?, ?, ?, ?, ?)");
$stmt->bind_param("issss", $userId, $firstName, $lastName, $phoneNumber, $email);

if ($stmt->execute()) {
    returnWithInfo("ContactAddedSuccess", "The contact has been added successfully.");
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

function returnWithInfo($success, $message) {
    $returnArray = array("success" => $success, "message" => $message);
    header("Content-type: application/json; charset=utf-8");
    http_response_code(200);
    echo json_encode($returnArray);
}

?>
