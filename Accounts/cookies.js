// Function to check login status
function checkLoginStatus() {
    fetch('/Accounts/session_check.php')
        .then(response => response.json())
        .then(data => {
            if (data.loggedIn) {
                console.log('User is logged in:', data.username);
                // Update UI to show signed in state
                updateUIForLoggedInUser(data.username);
            } else {
                console.log('User is not logged in');
            }
        })
        .catch(error => console.error('Error checking login status:', error));
}

function updateUIForLoggedInUser(username) {
    // Example: Change "Sign In" button to "Profile" or "Logout"
    // This depends on your navbar structure. 
    // Assuming you might have an element with id 'signin-link' or similar in your navbar
    
    // Attempt to find a sign in link/button in common locations
    const navbarLinks = document.querySelectorAll('#navbar a');
    navbarLinks.forEach(link => {
        if (link.href && link.href.includes('signin.html')) {
            link.textContent = username; // Or 'Profile'
            link.href = '#'; // Or link to a profile page
            
            // Optional: Add logout functionality
            // For now just showing the name as requested
        }
    });
}

// Check status on page load
document.addEventListener('DOMContentLoaded', checkLoginStatus);

// Legacy code kept for reference if needed, but not attached to DOM elements
// that might not exist on every page.
// document.getElementById('sign_in_button').addEventListener...
