function createLoginCookie(username){
    current_date = new Date();
    c = new Date(current_date.getTime() + 30*24*60*60*1000).toUTCString();

    expiredate = new Date(current_date.getTime() - 1*24*60*60*1000).toUTCString();
    document.cookie = "username=; expires=" + expiredate + "; path=/";
}

function checkLoginStatus() {
    document.cookie.split(';').forEach(cookie => {
        const [name, value] = cookie.trim().split('=');
        if (name === 'username' && value) {
            updateUIForLoggedInUser(decodeURIComponent(value));
        }
    }
}

function updateUIForLoggedInUser(username) {
    // Attempt to find a sign in link/button in common locations
    const navbarLinks = document.querySelectorAll('#navbar a');
    navbarLinks.forEach(link => {
        if (link.href && link.href.includes('signin.html')) {
            link.textContent = username; // Or 'Profile'
            link.href = '#'; // Or link to a profile page
                    }
    });
}

document.addEventListener('DOMContentLoaded', checkLoginStatus);
return;
