<?php
error_reporting(E_ALL);
ini_set("display_errors", 1);

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
        header("Content-Type: application/json; charset=UTF-8");
        http_response_code(405);
        echo generateError(
            "405 (Method Not Allowed)",
            "InvalidRequestMethod",
            "Only POST request will be processed by this endpoint."
        );
        return;
    }

    if (!array_key_exists("user-agent", $headers) || is_null($headers["user-agent"])) {
        header("Content-Type: application/json; charset=UTF-8");
        http_response_code(400);
        echo generateError(
            "400 (Bad Request)",
            "MissingAgentHeader",
            "The request is missing an expected user-agent header."
        );
        return;
    }

    $agentPieces = explode("/", $headers["user-agent"]);

    if ($agentPieces[0] && strtolower($agentPieces[0]) !== "github-hookshot") {
        header("Content-Type: application/json; charset=UTF-8");
        http_response_code(400);
        echo generateError(
            "400 (Bad Request)",
            "InvalidAgentHeader",
            "The request does not contain a valid user-agent header field."
        );
        return;
    }

    if (!array_key_exists("x-github-event", $headers) || is_null($headers["x-github-event"])
        || !array_key_exists("x-hub-signature-256", $headers)
        || is_null($headers["x-hub-signature-256"])
    ) {
        header("Content-Type: application/json; charset=UTF-8");
        http_response_code(400);
        echo generateError(
            "400 (Bad Request)",
            "MissingSignatureHeader",
            "The request is missing HTTP headers that are expected."
        );
        return;
    }

    $event = $headers["x-github-event"];
    $signature = $headers["x-hub-signature-256"];

    if (!in_array($event, $acceptedEvents)) {
        header("Content-Type: application/json; charset=UTF-8");
        http_response_code(400);
        echo generateError(
            "400 (Bad Request)",
            "InvalidEvent",
            "The request has an event header that this endpoint ignores ({$event})."
        );
        return;
    }

    $webhookSecret = getenv("GITHUB_WEBHOOK_SECRET");

    if (!$webhookSecret) {
        header("Content-Type: application/json; charset=UTF-8");
        http_response_code(500);
        echo generateError(
            "500 (Internal Server Error)",
            "TokenRetrievalError",
            "Server failed to retrieve the encryption token."
        );
        return;
    }

    $hash = "sha256=" . hash_hmac("sha256", $dataText, $webhookSecret);

    if (!hash_equals($hash, $signature)) {
        header("Content-Type: application/json; charset=UTF-8");
        http_response_code(400);
        echo generateError(
            "400 (Bad Request)",
            "InvalidSignature",
            "The request has an invalid or malformed signature."
        );
        return;
    }

    if (!array_key_exists("ref", $data) || is_null($data["ref"])) {
        header("Content-Type: application/json; charset=UTF-8");
        http_response_code(400);
        echo generateError(
            "400 (Bad Request)",
            "InvalidRefField",
            "The request does not contain a proper ref field."
        );
        return;
    } elseif ($data["ref"] !== "refs/heads/main") {
        header("Content-Type: application/json; charset=UTF-8");
        http_response_code(202);
        echo json_encode(array(
            "response" => "Request accepted, but processing refused due to branch of commit in ref field."
        ));
        return;
    }

    header("Content-Type: text/html; charset=UTF-8");
    echo shell_exec("cd /opt/bitnami/apache/htdocs && sudo -u bitnami git pull origin main 2>&1");
    http_response_code(200);
}

processRequest()
?>
