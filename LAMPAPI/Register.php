<?php

    require 'DBConnection.php';
    $inData = getRequestInfo();

    $id = 0;
    $username = "";
    $password = ""; // this will be used for checking if an account exists

    // check account exists

    $newUsername = $inData['username'];
    $newPassword = $inData['password']; 

    if (empty($newUsername) || empty($newPassword)) {
        returnWithError("All fields must be filled.");
    } // Validate fields
    else {
        $newHashedPassword = password_hash($newPassword, PASSWORD_BCRYPT); // hashing for security
        $registerUser = $conn->prepare("INSERT INTO Users (Username,Password) VALUES (?,?)");
        $registerUser->bind_param("ss", $newUsername, $newHashedPassword);

        if ($registerUser->execute()) {
            $getRegisterUser = $conn->prepare("SELECT ID FROM Users WHERE Username=?");
            $getRegisterUser->bind_param("s", $newUsername);
            $getRegisterUser->execute();
            $result = $getRegisterUser->get_result();

            if ($row = $result->fetch_assoc()) {
                returnWithInfo($row['username'], $row['password'], $row['ID']);
            }   
            else {
                returnWithError("You should never see this");
            }
        }

        $registerUser->close();
        $getRegisterUser->close();
        $conn->close();
    } // create user

    function getRequestInfo() {
        return json_decode(file_get_contents('php://input'), true);
    }

    function sendResultInfoAsJson($obj) {
    	header('Content-type: application/json');
    	echo $obj;
    }

    function returnWithError ($err) {
        $retValue = '{"userId":0,"username":"","error":"' . $err . '"}';
        http_response_code(400);
        sendResultInfoAsJson($retValue);
    }

    function returnWithInfo ($username, $id) {
        $retValue = '{"userId":' . $id . ',"username":"' . $username . '","error":""}';
        http_response_code(201);
        sendResultInfoAsJson($retValue);
    }

?>