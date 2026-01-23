// Token Usage Management

// Initialize token count
let tokenCount = 0;

// Token limits
const TOKEN_LIMITS = {
    free: 10000,
    premium: 100000
};

// Get current token count
function getTokenCount() {
    return tokenCount;
}

// Update token count
function updateTokenCount(count) {
    tokenCount = count;
    updateTokenUsageUI();
}

// Increment token count
function incrementTokenCount(count) {
    tokenCount += count;
    updateTokenUsageUI();
}

// Reset token count
function resetTokenCount() {
    tokenCount = 0;
    updateTokenUsageUI();
}

// Update token usage UI
function updateTokenUsageUI() {
    const tokenUsageBar = document.getElementById('token-usage');
    const tokenUsageText = document.getElementById('token-usage-text');

    if (tokenUsageBar && tokenUsageText) {
        const userType = getUserType(); // Implement this function based on your auth system
        const limit = userType === 'premium' ? TOKEN_LIMITS.premium : TOKEN_LIMITS.free;

        tokenUsageBar.value = tokenCount;
        tokenUsageBar.max = limit;
        tokenUsageText.textContent = `Tokens Used: ${tokenCount} / ${limit}`;

        // Check if user has exceeded the limit
        if (tokenCount >= limit) {
            showTokenLimitReached();
        }
    }
}

// Show token limit reached message
function showTokenLimitReached() {
    alert('You have reached your token limit. Please upgrade to continue using the service.');
    // Optionally redirect to upgrade page
    // window.location.href = '../Accounts/upgrade.html';
}

// Get user type (free or premium)
function getUserType() {
    // Implement this function based on your authentication system
    // For example, you might check a cookie or localStorage
    return 'free'; // Default to free tier
}

// Initialize token usage
function initTokenUsage() {
    // Load token count from localStorage or API
    const savedCount = localStorage.getItem('scutoid_token_count');
    if (savedCount) {
        tokenCount = parseInt(savedCount);
    }
    updateTokenUsageUI();
}

// Save token count to localStorage
function saveTokenCount() {
    localStorage.setItem('scutoid_token_count', tokenCount.toString());
}

// Export functions for use in other scripts
export {
    getTokenCount,
    updateTokenCount,
    incrementTokenCount,
    resetTokenCount,
    updateTokenUsageUI,
    initTokenUsage,
    saveTokenCount
};