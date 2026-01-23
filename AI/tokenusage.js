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
    saveTokenCount();
    updateTokenUsageUI();
}

// Increment token count
function incrementTokenCount(count) {
    tokenCount += count;
    saveTokenCount();
    updateTokenUsageUI();
}

// Reset token count
function resetTokenCount() {
    tokenCount = 0;
    saveTokenCount();
    updateTokenUsageUI();
}

// Update token usage UI
function updateTokenUsageUI() {
    const tokenUsageBar = document.getElementById('token-usage');
    const tokenUsageText = document.getElementById('token-usage-text');

    if (tokenUsageBar && tokenUsageText) {
        const userType = getUserType(); 
        const limit = userType === 'premium' ? TOKEN_LIMITS.premium : TOKEN_LIMITS.free;

        tokenUsageBar.value = tokenCount;
        tokenUsageBar.max = limit;
        tokenUsageText.textContent = `Tokens Used: ${tokenCount} / ${limit}`;

        if (tokenCount >= limit) {
            showTokenLimitReached();
        }
    }
}

function showTokenLimitReached() {
    // We'll let the calling script handle blocking, but we can alert here
    console.warn('Token limit reached');
}

function getUserType() {
    // Simple check: if there's a specific cookie or localStorage item
    return localStorage.getItem('scutoid_user_type') || 'free';
}

function initTokenUsage() {
    const savedCount = localStorage.getItem('scutoid_token_count');
    if (savedCount) {
        tokenCount = parseInt(savedCount);
    }
    updateTokenUsageUI();
}

function saveTokenCount() {
    localStorage.setItem('scutoid_token_count', tokenCount.toString());
}

// Make functions globally available
window.tokenUsage = {
    init: initTokenUsage,
    increment: incrementTokenCount,
    getCount: getTokenCount,
    getLimit: () => (getUserType() === 'premium' ? TOKEN_LIMITS.premium : TOKEN_LIMITS.free)
};