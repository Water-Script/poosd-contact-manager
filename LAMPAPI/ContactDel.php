<?php

error_reporting(-1);
ini_set("display_errors", "1");
ini_set("log_errors", 1);

// Include the database connection file
require "DBConnection.php";
$inData = getRequestInfo();

// Ensure required fields exist
if (!isset($inData["userId"], $inData["contactId"])) {
    returnWithError("MissingFieldsError", "Required fields are missing.", 400);
    exit();
}

$userId = $inData["userId"];
$contactId = $inData["contactId"];

// Prepare SQL statement to delete the contact
$stmt = $conn->prepare("DELETE FROM Contacts WHERE ID = ? AND UserID = ?");
$stmt->bind_param("ii", $contactId, $userId);

if ($stmt->execute()) {
    if ($stmt->affected_rows > 0) {
        returnWithInfo("ContactDeletedSuccess", "The contact has been deleted successfully.");
    } else {
        returnWithError("ContactNotFoundError", "The contact does not exist or does not belong to the user.", 404);
    }
} else {
    returnWithError("DatabaseError", "Failed to delete the contact.", 500);
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
