<?php
header('Content-Type: application/json');
header('Cache-Control: no-cache, no-store, must-revalidate');
header('Pragma: no-cache');
header('Expires: 0');

// Start session if not already started
if (session_status() === PHP_SESSION_NONE) {
    session_start();
}

// Check if user is logged in
$loggedIn = isset($_SESSION['user_id']) || isset($_SESSION['loggedin']);
$username = isset($_SESSION['username']) ? $_SESSION['username'] : 'User';

// Return JSON response
echo json_encode([
    'loggedIn' => $loggedIn,
    'username' => $username
]);
?>
