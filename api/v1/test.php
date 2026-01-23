<?php
header("Content-Type: application/json");

// 1. Get the API Key from headers or query parameters
$apiKey = '';

// Check header (best practice)
$headers = getallheaders();
if (isset($headers['X-Api-Key'])) {
    $apiKey = $headers['X-Api-Key'];
} elseif (isset($_GET['api_key'])) {
    // Fallback to query param
    $apiKey = $_GET['api_key'];
}

if (empty($apiKey)) {
    http_response_code(401); // Unauthorized
    echo json_encode(["status" => "error", "message" => "Missing API Key"]);
    exit();
}

// 2. Validate API Key against Database
$servername = "localhost";
$username = "scutoid_users";
$password = "@Scutoids456";
$dbname = "scutoid_users";
$port = 3306;

$conn = new mysqli($servername, $username, $password, $dbname, $port);
if ($conn->connect_error) {
    http_response_code(500);
    echo json_encode(["status" => "error", "message" => "Database connection failed"]);
    exit();
}

$stmt = $conn->prepare("SELECT username FROM users WHERE api_key = ?");
$stmt->bind_param("s", $apiKey);
$stmt->execute();
$result = $stmt->get_result();

if ($result->num_rows > 0) {
    // Valid Key
    $userRow = $result->fetch_assoc();
    $apiUser = $userRow['username'];

    // 3. Perform API Logic
    // For now, just a test response.
    echo json_encode([
        "status" => "success",
        "message" => "Hello, " . $apiUser . "! Your API Key is valid.",
        "data" => [
            "timestamp" => date("Y-m-d H:i:s"),
            "service" => "Scutoid Basic API"
        ]
    ]);

} else {
    // Invalid Key
    http_response_code(403); // Forbidden
    echo json_encode(["status" => "error", "message" => "Invalid API Key"]);
}

$stmt->close();
$conn->close();
?>
