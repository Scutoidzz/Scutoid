<?php
session_start();

$servername = "localhost";
$username = "scutoid_users";
$password = "@Scutoids456";
$dbname = "scutoid_users";
$port = 3306;

$conn = new mysqli($servername, $username, $password, $dbname, $port);

if ($conn->connect_error) {
    die("Connection failed: " . $conn->connect_error);
}

if ($_SERVER["REQUEST_METHOD"] == "POST") {
    $user = trim($_POST['username']);
    $pass = trim($_POST['password']);

    $stmt = $conn->prepare("SELECT username, password FROM users WHERE username = ?");
    $stmt->bind_param("s", $user);
    $stmt->execute();
    $result = $stmt->get_result();

    $credentials_valid = false;
    
    if ($result->num_rows > 0) {
        $row = $result->fetch_assoc();
        if ($pass === $row['password']) {
            $credentials_valid = true;
        }
    }

    if ($credentials_valid) {
        $_SESSION['username'] = $user;
        $_SESSION['logged_in'] = true;
        $_SESSION['loggedin'] = true;
        $_SESSION['user_id'] = $user;
        
        setcookie('username', $user, time() + (30 * 24 * 60 * 60), '/');
        
        header('Location: ../index.html');
        exit();
    } else {
        header('Location: signin.html?error=invalid_credentials');
        exit();
    }
    
    $stmt->close();
}

$conn->close();
?>