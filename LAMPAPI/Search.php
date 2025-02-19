<?php

error_reporting(-1);
ini_set("display_errors", "1");
ini_set("log_errors", 1); // Report errors in console if it occurs

require "DBConnection.php";

echo $_GET["userID"] . $_GET["type"] . $_GET["search"];

?>