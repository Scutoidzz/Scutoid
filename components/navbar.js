document.addEventListener("DOMContentLoaded", () => {
    // 1. Determine current path and active page
    const currentPath = window.location.pathname;
    const isAiPage = currentPath.includes('/AI/');
    const isAccountsPage = currentPath.includes('/Accounts/');
    
    // Helper to resolve relative paths
    const getPath = (path) => {
        if (isAiPage || isAccountsPage) return `../${path}`;
        return path;
    };

    // 2. Define Menu Items
    const menuItems = [
        { name: 'Home', path: 'index.html' },
        { name: 'Projects', path: 'index.html' }, // Placeholder based on current index content
        { name: 'AI', path: 'AI/aiview.html' },
        //{ name: 'Contact', path: 'contact.html' }
    ];

    // 3. Check authentication status
    const checkAuthStatus = async () => {
        try {
            const response = await fetch('/Accounts/session_check.php', {
                credentials: 'include'
            });
            
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            
            return await response.json();
        } catch (error) {
            console.error('Error checking auth status:', error);
            return { loggedIn: false };
        }
    };
    
    // 4. Build the user profile section based on auth status
    const buildUserProfile = async () => {
        const authData = await checkAuthStatus();
        
        if (authData.loggedIn) {
            return `
                <div class="user-profile-nav">
                    <div class="avatar">${authData.username ? authData.username.charAt(0).toUpperCase() : 'U'}</div>
                    <div class="user-info">
                        <div class="username" id="username_display">${authData.username || 'User'}</div>
                    </div>
                    <button id="auth_button" class="auth-btn nav-btn user-mode">
                        <span id="auth_button_text">Sign Out</span>
                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                            <path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4"></path>
                            <polyline points="10 17 15 12 10 7"></polyline>
                            <line x1="15" y1="12" x2="3" y2="12"></line>
                        </svg>
                    </button>
                </div>
            `;
        } else {
            return `
                <a href="${getPath('Accounts/signin.html')}" class="nav-link nav-btn" id="signin_link">Sign In</a>
            `;
        }
    };
    
    // 5. Build HTML
    const buildNavHTML = async () => {
        const userProfileHTML = await buildUserProfile();
        
        return `
            <nav class="main-navbar">
                <div class="nav-content">
                    <a href="${getPath('index.html')}" class="nav-logo">
                        Scutoid
                    </a>

                    <button class="mobile-menu-btn" aria-label="Toggle Menu">
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                            <line x1="3" y1="12" x2="21" y2="12"></line>
                            <line x1="3" y1="6" x2="21" y2="6"></line>
                            <line x1="3" y1="18" x2="21" y2="18"></line>
                        </svg>
                    </button>

                    <div class="nav-links">
                        ${menuItems.map(item => {
                            const href = getPath(item.path);
                            const isActive = currentPath.endsWith(item.path) || (item.name === 'Home' && currentPath.endsWith('/'));
                            return `<a href="${href}" class="nav-link ${isActive ? 'active' : ''}">${item.name}</a>`;
                        }).join('')}
                        
                        ${userProfileHTML}
                    </div>
                </div>
            </nav>
        `;
    };
    
    // 6. Inject styles if not present
    if (!document.querySelector('link[href*="navbar.css"]')) {
        const link = document.createElement('link');
        link.rel = 'stylesheet';
        link.href = getPath('components/navbar.css');
        document.head.appendChild(link);
    }

    // 7. Inject Navbar
    const injectNavbar = async () => {
        const navHTML = await buildNavHTML();
        const placeholder = document.getElementById('navbar-placeholder');
        
        if (placeholder) {
            placeholder.innerHTML = navHTML;
        } else {
            const tempDiv = document.createElement('div');
            tempDiv.innerHTML = navHTML;
            document.body.prepend(tempDiv.firstElementChild);
        }
        
        // Add sign out functionality if user is logged in
        const authButton = document.getElementById('auth_button');
        if (authButton) {
            authButton.addEventListener('click', async (e) => {
                e.preventDefault();
                try {
                    const response = await fetch('/Accounts/logout.php', {
                        method: 'POST',
                        credentials: 'include'
                    });
                    
                    if (!response.ok) {
                        throw new Error(`HTTP error! status: ${response.status}`);
                    }
                    
                    // Reload the page to update the navbar
                    window.location.reload();
                } catch (error) {
                    console.error('Error signing out:', error);
                    alert('Error signing out. Please try again.');
                }
            });
        }
        
        // Add sign in functionality
        const signinLink = document.getElementById('signin_link');
        if (signinLink) {
            signinLink.addEventListener('click', (e) => {
                e.preventDefault();
                window.location.href = getPath('Accounts/signin.html');
            });
        }
        
        // Mobile Menu Logic
        const mobileBtn = document.querySelector('.mobile-menu-btn');
        const navLinks = document.querySelector('.nav-links');
        
        if (mobileBtn && navLinks) {
            mobileBtn.addEventListener('click', () => {
                navLinks.classList.toggle('open');
            });
        }
    };
    
    // Initialize the navbar
    injectNavbar();
});
