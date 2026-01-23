<?php
// Database connection details
$servername = "localhost";
$username = "scutoid_users";
$password = "@Scutoids456";
$dbname = "scutoid_users";
$port = 3306;

// Create connection
$conn = new mysqli($servername, $username, $password, $dbname, $port);

// Check connection
if ($conn->connect_error) {
    die("Connection failed: " . $conn->connect_error);
}

    // Check if form is submitted
if ($_SERVER["REQUEST_METHOD"] == "POST") {
    // Trim whitespace to avoid accidental mismatch (copypaste spaces etc)
    $user = trim($_POST['username']);
    $pass = trim($_POST['password']);

    // Prevent SQL Injection
    // Debugging: Print received values (Comment out in production)
    // error_log("Attempting login: User=$user, Pass=$pass");

    $stmt = $conn->prepare("SELECT * FROM users WHERE username = ? AND password = ?");
    $stmt->bind_param("ss", $user, $pass);
    $stmt->execute();
    $result = $stmt->get_result();

    if ($result->num_rows > 0) {
        // Login success
        session_start();
        $_SESSION['username'] = $user;
        header("Location: ../index.html");
        exit();
    } else {
        // Login failed - Try to debug why
        /* 
        // Uncomment this block to debug if the user exists but password doesn't match
        $debug_stmt = $conn->prepare("SELECT * FROM users WHERE username = ?");
        $debug_stmt->bind_param("s", $user);
        $debug_stmt->execute();
        $debug_res = $debug_stmt->get_result();
        if ($debug_res->num_rows > 0) {
            $row = $debug_res->fetch_assoc();
            error_log("User found, but password mismatch. Input: '$pass', Stored: '" . $row['password'] . "'");
        } else {
            error_log("User '$user' not found in database.");
        }
        $debug_stmt->close(); 
        */

        header("Location: signin.html?error=invalid_credentials");
        exit();
    }
    
    $stmt->close();
}
$conn->close();
?>
