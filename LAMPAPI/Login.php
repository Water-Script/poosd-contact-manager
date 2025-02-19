<?php

error_reporting(-1);
ini_set("display_errors", "1");
ini_set("log_errors", 1);
// Include the database connection file
require "DBConnection.php";
$inData = getRequestInfo();

$username = $inData["username"];
$password = $inData["password"];

// Compare the password directly
if (empty($username) || empty($password)) {
    returnWithError("EmptyFieldsError", "Both fields must be filled to login.", 400);
    exit();
}

// Prepare SQL statement to find user by login
$loginUser = $conn->prepare("SELECT ID,Username,Password FROM Users WHERE Username=?");
$loginUser->bind_param("s", $username); // Bind the username value as a string
$loginUser->execute();
$result = $loginUser->get_result();
if ($row = $result->fetch_assoc()) {
    if ($password === $row["Password"]) {
        returnWithInfo($row["Username"], $row["ID"]);
    } 
    else {
        returnWithError("MismatchPasswordError","The input password is incorrect.", 400);
    }
} else {
    returnWithError("AccountNotFoundError","There is no account with this username.", 400);
}
// Close the statement
$loginUser->close();
$conn->close();

// Helper function to retrieve JSON input
function getRequestInfo() {
    return json_decode(file_get_contents("php://input"), true);
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

function returnWithInfo($username, $id) {
    $returnArray = array(
        "userId" => $id,
        "username" => $username
    );
    header("Content-type: application/json; charset=utf-8");
    http_response_code(200);
    echo json_encode($returnArray);
}

?>
