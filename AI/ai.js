// System Prompt
const SYSTEM_PROMPT = "You are Starry, a helpful AI assistant created by Scutoid. You are designed to be helpful, informative, and friendly while assisting users with their questions and tasks.";

document.addEventListener('DOMContentLoaded', () => {
    // DOM Elements
    const chatContainer = document.getElementById('chat_container');
    const messagesList = document.getElementById('messages_list');
    const userInput = document.getElementById('user_input');
    const submitBtn = document.getElementById('submit_msg_btn');
    const inputContainer = document.querySelector('.input-container');
    const modelSelector = document.getElementById('model_selector');
    const themeToggle = document.getElementById('theme_toggle');
    const newChatBtn = document.getElementById('new_chat_btn');
    const mobileMenuBtn = document.getElementById('mobile_menu_btn');
    const sidebar = document.getElementById('sidebar');
    const toggleSidebarBtn = document.getElementById('toggle_sidebar');
    const chatHistoryContainer = document.getElementById('chat_history');

    // Add event listener to form submission to prevent default reload
    const chatForm = document.getElementById('chat_form');
    if (chatForm) {
        chatForm.addEventListener('submit', (e) => {
            e.preventDefault();
            sendMessage();
        });
    }
    const welcomeScreen = document.getElementById('welcome_screen');
    // Settings Modal Elements
    const settingsBtn = document.getElementById('settings_btn');
    const settingsModal = document.getElementById('settings_modal');
    const closeSettingsBtn = document.getElementById('close_settings_btn');
    const deleteChatBtn = document.getElementById('delete_chat_btn');
    const clearAllChatsBtn = document.getElementById('clear_all_chats_btn');

    // State
    let chats = [];
    let currentChatId = null;
    let isWaitingForResponse = false;

    // Message Limit Logic
    const MESSAGE_LIMIT = 20;

    function getMessageCount() {
        return parseInt(localStorage.getItem('scutoid_message_count') || '0');
    }

    function incrementMessageCount() {
        const count = getMessageCount() + 1;
        localStorage.setItem('scutoid_message_count', count.toString());
        return count;
    }

    async function checkMessageLimit() {
        if (getMessageCount() >= MESSAGE_LIMIT) {
            try {
                // Check if user is logged in via session
                const response = await fetch('../Accounts/session_check.php');
                const data = await response.json();

                if (!data.loggedIn) {
                    alert('You have reached the free message limit. Please sign in to continue.');
                    window.location.href = '../Accounts/signin.html';
                    return false;
                }
            } catch (error) {
                console.error('Error checking login status:', error);
                alert('An error occurred. Please sign in again.');
                window.location.href = '../Accounts/signin.html';
                return false;
            }
        }
        return true;
    }

    // Initialization
    init();

    function init() {
        loadTheme();
        loadChats();

        // ... [rest of the original ai.js content] ...
    }

    // ... [rest of the original functions] ...
});