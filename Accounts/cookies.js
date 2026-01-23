function createLoginCookie(username) {
    const current_date = new Date();
    const expiredate = new Date(current_date.getTime() + 30*24*60*60*1000).toUTCString();
    document.cookie = "username=" + encodeURIComponent(username) + "; expires=" + expiredate + "; path=/";
}

function checkLoginStatus() {
    const cookies = document.cookie.split(';');
    for (let cookie of cookies) {
        const [name, value] = cookie.trim().split('=');
        if (name === 'username' && value) {
            updateUIForLoggedInUser(decodeURIComponent(value));
            return true;
        }
    }
    return false;
}

function updateUIForLoggedInUser(username) {
    const signinLinks = document.querySelectorAll('a[href*="signin.html"]');
    signinLinks.forEach(link => {
        link.textContent = username;
        link.href = '#'; // Or link to profile page
        link.onclick = (e) => {
            e.preventDefault();
            // Optionally show user menu
        };
    });
}


function logout() {
    // Expire the cookie
    document.cookie = "username=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
    window.location.href = '../Accounts/signin.html';
}

// Run on page load
document.addEventListener('DOMContentLoaded', checkLoginStatus);