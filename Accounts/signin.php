
<?php
session_start();

    // Database connection details
    $servername = "localhost";
    $username = "scutoid_users";
    $password = "@Scutoids456";
    $dbname = "scutoid_users";
    $port = 3306;

    if ($credentials_valid) {
    // Set session
    $_SESSION['username'] = $username;
    $_SESSION['logged_in'] = true;
    
    // Set cookie (30 days)
    setcookie('username', $username, time() + (30 * 24 * 60 * 60), '/');
    
    // Redirect with success
    header('Location: signin.html?login=success&username=' . urlencode($username));
    exit();
} else {
    header('Location: signin.html?error=invalid_credentials');
    exit();
}
?>