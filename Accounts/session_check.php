<?php
header('Content-Type: application/json');
header('Cache-Control: no-cache, no-store, must-revalidate');

if (session_status() === PHP_SESSION_NONE) {
    session_start();
}

// Check multiple possible session variables (since your code sets different ones)
$loggedIn = isset($_SESSION['user_id']) || isset($_SESSION['loggedin']) || isset($_SESSION['logged_in']);
$username = isset($_SESSION['username']) ? $_SESSION['username'] : 'User';

echo json_encode([
    'loggedIn' => $loggedIn,
    'username' => $username
]);
?>