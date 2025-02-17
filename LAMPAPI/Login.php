<?php

error_reporting(-1);
ini_set("display_errors", "1");
ini_set("log_errors", 1);
// Include the database connection file
require "DBConnection.php";
$inData = getRequestInfo();

// Prepare SQL statement to find user by login
$stmt = $conn->prepare("SELECT ID,Username,Password FROM Users WHERE Username=?");
$stmt->bind_param("s", $inData["username"]); // Bind the username value as a string
$stmt->execute();
$result = $stmt->get_result();
if ($row = $result->fetch_assoc()) {
    // Compare the password directly 
    if ($inData["password"] === $row["Password"]) {
        returnWithInfo($row["Username"], $row["ID"]);
    } 
    else {
        returnWithError("MismatchPasswordError","The inputted password is incorrect.");
    }
} else {
    returnWithError("NonexistentUserError","There is no user with this username.");
}
// Close the statement
$stmt->close();
$conn->close();

// Helper function to retrieve JSON input
function getRequestInfo() {
    return json_decode(file_get_contents("php://input"), true);
}

function returnWithError($err, $message) {
    $returnArray = array(
        "error" => $err,
        "message" => $message
    );
    header("Content-type: application/json; charset=utf-8");
    http_response_code(400);
    echo json_encode($returnArray);
}

function returnWithInfo($username, $id) {
    $returnArray = array(
        "userId" => $id,
        "username" => $username
    );
    header("Content-type: application/json; charset=utf-8");
    http_response_code(201);
    echo json_encode($returnArray);
}

?>
