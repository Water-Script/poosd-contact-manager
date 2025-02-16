<?php

    require 'DBConnection.php';
    $inData = getRequestInfo();

    $username = $inData['username'];
    $password = $inData['password']; 

    $checkUser = $conn->prepare("SELECT ID FROM Users WHERE Username=?");
    $checkUser->bind_param("s", $username);
    $checkUser->execute();
    if ($row = $result->fetch_assoc()) {
        returnWithError("A user already exists with this username.");
    }
    else {
        if (empty($username) || empty($password)) {
            returnWithError("All fields must be filled.");
        } // Validate fields
        else {
            $hashedPassword = password_hash($password, PASSWORD_BCRYPT); // hashing for security
            $registerUser = $conn->prepare("INSERT INTO Users (Username,Password) VALUES (?,?)");
            $registerUser->bind_param("ss", $username, $hashedPassword);

            if ($registerUser->execute()) {
                $getRegisterUser = $conn->prepare("SELECT ID FROM Users WHERE Username=?");
                $getRegisterUser->bind_param("s", $username);
                $getRegisterUser->execute();
                $result = $getRegisterUser->get_result();

                if ($row = $result->fetch_assoc()) {
                    returnWithInfo($username, $row['ID']);
                }   
                else {
                    returnWithError("You should never see this");
                }
            }

            $registerUser->close();
            $getRegisterUser->close();
            $conn->close();
        } // create user
    }

    function getRequestInfo() {
        return json_decode(file_get_contents('php://input'), true);
    }

    function sendResultInfoAsJson($obj) {
    	header('Content-type: application/json');
    	echo $obj;
    }

    function returnWithError ($err) {
        $retValue = '{"userId":"","username":"","error":"' . $err . '"}';
        http_response_code(400);
        sendResultInfoAsJson($retValue);
    }

    function returnWithInfo ($username, $id) {
        $retValue = '{"userId":' . $id . ',"username":"' . $username . '","error":""}';
        http_response_code(201);
        sendResultInfoAsJson($retValue);
    }

?>