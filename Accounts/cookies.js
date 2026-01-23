function createLoginCookie(username) {
    const current_date = new Date();
    const expiredate = new Date(current_date.getTime() + 30*24*60*60*1000).toUTCString();
    document.cookie = "username=" + encodeURIComponent(username) + "; expires=" + expiredate + "; path=/";
}

function checkLoginStatus() {
    document.cookie.split(';').forEach(cookie => {
        const [name, value] = cookie.trim().split('=');
        if (name === 'username' && value) {
            updateUIForLoggedInUser(decodeURIComponent(value));
        }
    });
}

function updateUIForLoggedInUser(username) {
    const navbarLinks = document.querySelectorAll('#navbar a');
    navbarLinks.forEach(link => {
        if (link.href && link.href.includes('signin.html')) {
            link.textContent = username;
            link.href = '#'; // Or link to a profile page
        }
    });
}

document.addEventListener('DOMContentLoaded', checkLoginStatus);