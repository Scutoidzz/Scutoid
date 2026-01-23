<?php
session_start();

// Clear session
$_SESSION = array();

// Delete cookies
if (isset($_COOKIE[session_name()])) {
    setcookie(session_name(), '', time()-3600, '/');
}
setcookie('username', '', time()-3600, '/');

session_destroy();

header('Content-Type: application/json');
echo json_encode(['success' => true]);
?>