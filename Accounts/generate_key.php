<?php
session_start();
if (!isset($_SESSION['username'])) {
    header("Location: signin.html");
    exit();
}

// Database connection
$servername = "localhost";
$username = "scutoid_users";
$password = "@Scutoids456";
$dbname = "scutoid_users";
$port = 3306;

$conn = new mysqli($servername, $username, $password, $dbname, $port);
if ($conn->connect_error) {
    die("Connection failed: " . $conn->connect_error);
}

$user = $_SESSION['username'];

// Generate a random API key (32 bytes -> 64 hex chars)
$newKey = bin2hex(random_bytes(32));

// Update database
$stmt = $conn->prepare("UPDATE users SET api_key = ? WHERE username = ?");
$stmt->bind_param("ss", $newKey, $user);

if ($stmt->execute()) {
    // Success
    header("Location: profile.php?status=generated");
} else {
    // Error
    header("Location: profile.php?error=failed");
}

$stmt->close();
$conn->close();
?>
