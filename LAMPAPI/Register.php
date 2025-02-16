<?php

    error_reporting(-1); 
    ini_set("display_errors", "1"); 
    ini_set("log_errors", 1); // Report errors in console if it occurs

    require 'DBConnection.php'; 
    $inData = getRequestInfo();

    $username = $inData['username'];
    $password = $inData['password']; 

    $checkUser = $conn->prepare("SELECT ID FROM Users WHERE Username=?");
    $checkUser->bind_param("s", $username);
    $checkUser->execute();
    $result = $checkUser->get_result(); // Check if a user exists

    if ($row = $result->fetch_assoc()) {
        returnWithError("A user already exists with this username.");
    }
    else {
        if (empty($username) || empty($password)) {
            returnWithError("All fields must be filled.");
        } // Validate fields not being empty
        else {
            $registerUser = $conn->prepare("INSERT INTO Users (Username,Password) VALUES (?,?)");
            $registerUser->bind_param("ss", $username, $password);

            if ($registerUser->execute()) {
                $getRegisterUser = $conn->prepare("SELECT ID FROM Users WHERE Username=?");
                $getRegisterUser->bind_param("s", $username);
                $getRegisterUser->execute();
                $result = $getRegisterUser->get_result(); // create user

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

    function returnWithError ($err) {
        $returnArray = array(
            "error" => $err
        );
        header("Content-type: application/json; charset=utf-8");
        http_response_code(400);
        echo json_encode($returnArray);
    }

    function returnWithInfo ($username, $id) {
        $returnArray = array(
            "userId" => $id,
            "username" => $username
        );
        header("Content-type: application/json; charset=utf-8");
        http_response_code(201);
        echo json_encode($returnArray);
    }

?>