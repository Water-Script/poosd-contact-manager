<?php
//error_reporting(E_ALL);
//ini_set("display_errors", 1);

function generateError($httpError, $errorName, $errorMessage) {
    return json_encode(array(
        "response" => $httpError,
        "error" => $errorName,
        "message" => $errorMessage
    ));
}

$acceptedEvents = array("ping", "push");

function processRequest() {
    global $acceptedEvents;

    $dataText = file_get_contents("php://input");
    $data = json_decode($dataText, true);
    $headers = array_change_key_case(apache_request_headers());

    if ($_SERVER["REQUEST_METHOD"] != "POST") {
        http_response_code(405);
        echo generateError("405 (Method Not Allowed)", "InvalidRequestMethod", "Only POST request will be processed by this endpoint.");
        return;
    }


    //$agent = explode($headers["user-agent"], "/");

    //if ($agent[1] != "github-hookshot") {
     //   http_response_code(400);
    //    return;
    //}

    if (!array_key_exists("x-github-event", $headers) || is_null($headers["x-github-event"])
        || !array_key_exists("x-hub-signature-256", $headers) || is_null($headers["x-hub-signature-256"])
    ) {
        http_response_code(400);
        echo generateError("400 (Bad Request)", "MissingHeader", "The request is missing HTTP headers that are expected.");
        return;
    }

    $event = $headers["x-github-event"];
    $signature = $headers["x-hub-signature-256"];

    if (!in_array($event, $acceptedEvents)) {
        http_response_code(400);
        echo generateError("400 (Bad Request)", "InvalidEvent", "The request has an event header that this endpoint ignores ({$event}).");
        echo $headers["x-github-event"];
        return;
    }

    //echo "Checking hash (with getenv)...\n";

    $webhookSecret = getenv("GITHUB_WEBHOOK_SECRET");

    if (!$webhookSecret) {
        http_response_code(500);
        echo generateError("500 (Internal Server Error)", "TokenRetrievalError", "Server failed to retrieve the encryption token.");
        return;
    }

    $hash = "sha256=" . hash_hmac("sha256", $dataText, $webhookSecret);

    if (!hash_equals($hash, $signature)) {
        http_response_code(401);
        echo generateError("400 (Bad Request)", "InvalidSignature", "The request has an invalid or malformed signature.");
        //echo "\n";
        //echo json_encode(["hash" => "$hash", "signature" => "$signature"]);
        //echo "\nData dump:\n";
        //echo $dataText;
        return;
    }

    // We might have to cd up a level...
    shell_exec("git pull origin main");
    http_response_code(200);
}

processRequest()
?>
