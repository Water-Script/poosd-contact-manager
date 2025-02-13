<?php
$servername = "localhost";
$username = "Robot";
$password = "very_secret_and_secure";
$database = "PROJECT";

$conn = new mysqli($servername, $username, $password, $database);

if ($conn->connect_error) {
    die("Connection error: " . mysqli_connect_error());
}

echo "Connected successfully";
?>