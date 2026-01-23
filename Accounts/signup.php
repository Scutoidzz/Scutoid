<?php
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
    $user = trim($_POST['username']);
    $email = trim($_POST['email']);
    $pass = trim($_POST['password']);

    // Check if user already exists
    $check_stmt = $conn->prepare("SELECT * FROM users WHERE username = ?");
    $check_stmt->bind_param("s", $user);
    $check_stmt->execute();
    $result = $check_stmt->get_result();

    if ($result->num_rows > 0) {
        header("Location: signup.html?error=exists");
        exit();
    }
    $check_stmt->close();

    // Insert new user
    // NOTE: Storing plain text password as requested/implied by "plain text" feedback.
    // In production, use password_hash($pass, PASSWORD_DEFAULT);
    $stmt = $conn->prepare("INSERT INTO users (username, password, email) VALUES (?, ?, ?)");
    $stmt->bind_param("sss", $user, $pass, $email);

    if ($stmt->execute()) {
        // Registration successful - auto login
        session_start();
        $_SESSION['username'] = $user;
        header("Location: ../index.html");
        exit();
    } else {
        header("Location: signup.html?error=failed");
        exit();
    }
    
    $stmt->close();
}
$conn->close();
?>
