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
$apiKey = "No API Key generated yet.";

// Fetch current API key
$stmt = $conn->prepare("SELECT api_key FROM users WHERE username = ?");
$stmt->bind_param("s", $user);
$stmt->execute();
$result = $stmt->get_result();

if ($result->num_rows > 0) {
    $row = $result->fetch_assoc();
    if (!empty($row['api_key'])) {
        $apiKey = $row['api_key'];
    }
}
$stmt->close();
$conn->close();
?>

<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <link rel="stylesheet" href="../styles.css">
    <title>Profile - Scutoid</title>
</head>
<body>
    <div id="navbar">
        <a href="../index.html">Home</a>
        <a href="../projects.html">Projects</a>
        <a href="../about.html">AI</a>
        <a href="../contact.html">Contact</a>
    </div>

    <h1>User Profile: <?php echo htmlspecialchars($user); ?></h1>

    <div style="margin: 20px; padding: 20px; border: 1px solid #ccc;">
        <h2>API Access</h2>
        <p>Your API Key is used to access Scutoid API services.</p>
        
        <div style="background: #f4f4f4; padding: 10px; font-family: monospace; margin-bottom: 10px;">
            <?php echo htmlspecialchars($apiKey); ?>
        </div>

        <form action="generate_key.php" method="POST">
            <button type="submit" style="padding: 10px;">Generate New API Key</button>
        </form>
        <p style="color: red; font-size: 0.8em;">Warning: Generating a new key will invalidate your old one.</p>
    </div>

    <a href="../index.html"><button>Back to Home</button></a>
</body>
</html>
