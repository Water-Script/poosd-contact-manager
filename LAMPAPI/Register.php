<?php
error_reporting(-1);
ini_set("display_errors", "1");
ini_set("log_errors", 1); // Report errors in console if it occurs

require "DBConnection.php";
$inData = getRequestInfo();

$username = $inData["username"];
$password = $inData["password"];

$checkUser = $conn->prepare("SELECT ID FROM Users WHERE Username=?");
$checkUser->bind_param("s", $username);
$checkUser->execute();
$result = $checkUser->get_result();  // Check if a user exists

if ($row = $result->fetch_assoc()) {
    returnWithError("ExistingUserError", "An account already exists with that username.", 400);
    exit();
}

if (empty($username) || empty($password)) {
    returnWithError("MalformedRequestError", "All fields must be filled.", 400);
    exit();
}  // Validate fields not being empty

$result->close();

$registerUser = $conn->prepare("INSERT INTO Users (Username,Password) VALUES (?,?)");
$registerUser->bind_param("ss", $username, $password);

if ($registerUser->execute()) {
    $getRegisterUser = $conn->prepare("SELECT ID, Username FROM Users WHERE Username=?");
    $getRegisterUser->bind_param("s", $username);
    $getRegisterUser->execute();
    $result = $getRegisterUser->get_result();  // create user

    if ($row = $result->fetch_assoc()) {
        returnWithInfo($row["Username"], $row["ID"]);
    } else {
        returnWithError("InternalServerError", "The server has encountered an internal error during the processing of the request.", 500);
    }
}

$registerUser->close();
$getRegisterUser->close();
$conn->close();

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
    http_response_code(201);
    echo json_encode($returnArray);
}

?>