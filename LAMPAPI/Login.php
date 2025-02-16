<?php

error_reporting(-1);
ini_set("display_errors", "1");
ini_set("log_errors", 1);
// Include the database connection file
require "DBConnection.php";

$inData = getRequestInfo();

// Check if connection is available
if (!$conn) {
    returnWithError("Database connection error.");
} else {
    // Prepare SQL statement to find user by login
    $stmt = $conn->prepare("SELECT ID, firstName, lastName, password FROM Users WHERE login=?");
    $stmt->bind_param("s", $inData["login"]); // Bind the login value as a string
    $stmt->execute();
    $result = $stmt->get_result();

    if ($row = $result->fetch_assoc()) {
        // Compare the password directly (WARNING: Not secure)
        if ($inData["password"] === $row['password']) {
            returnWithInfo($row['firstName'], $row['lastName'], $row['ID']);
        } else {
            returnWithError("Incorrect Password");
        }
    } else {
        returnWithError("No User Found");
    }

    // Close the statement
    $stmt->close();
}

// Helper function to retrieve JSON input
function getRequestInfo() {
    return json_decode(file_get_contents("php://input"), true);
}

// Helper function to send JSON response
function sendResultInfoAsJson($obj, $statusCode = 200) {
    header('Content-type: application/json');
    http_response_code($statusCode);
    echo $obj;
}

// Helper function to return an error message
function returnWithError($err) {
    $retValue = json_encode(["id" => 0, "firstName" => "", "lastName" => "", "error" => $err]);
    sendResultInfoAsJson($retValue, 400);
}

// Helper function to return success response
function returnWithInfo($firstName, $lastName, $id) {
    $retValue = json_encode(["id" => $id, "firstName" => $firstName, "lastName" => $lastName, "error" => ""]);
    sendResultInfoAsJson($retValue);
}
?>
