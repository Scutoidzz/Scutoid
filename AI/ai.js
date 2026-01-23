// System Prompt
const SYSTEM_PROMPT = "You are Starry, a helpful AI assistant created by Scutoid. You are designed to be helpful, informative, and friendly while assisting users with their questions and tasks.";

// Model Mapping
const MODEL_MAPPING = {
    'starry-14b': 'ministral-14b-latest',
    'starry-img': 'mistral-large-latest',
    'thinking-model': 'mistral-large-latest'
};

// Message Limit
    const MESSAGE_LIMIT = 20;

// State
let chats = [];
let currentChatId = null;
let isWaitingForResponse = false;

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

    // Initialization
    init();

    function init() {
        loadTheme();
        loadChats();

        // Event Listeners
        if (submitBtn) {
            submitBtn.addEventListener('click', (e) => {
                e.preventDefault();
                sendMessage();
});
        }

        userInput.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                sendMessage();
            }
            adjustTextareaHeight();
        });

        userInput.addEventListener('input', () => {
            adjustTextareaHeight();
            submitBtn.disabled = userInput.value.trim() === '';
        });

        themeToggle.addEventListener('click', toggleTheme);
        newChatBtn.addEventListener('click', createNewChat);

        if (mobileMenuBtn) {
            mobileMenuBtn.addEventListener('click', () => {
                sidebar.classList.add('open');
            });
        }

        if (toggleSidebarBtn) {
            toggleSidebarBtn.addEventListener('click', () => {
                sidebar.classList.remove('open');
            });
        }

        if (settingsBtn) {
            settingsBtn.addEventListener('click', () => {
                settingsModal.style.display = 'flex';
                deleteChatBtn.disabled = !currentChatId;
            });
        }

        if (closeSettingsBtn) {
            closeSettingsBtn.addEventListener('click', () => {
                settingsModal.style.display = 'none';
            });
        }

        if (deleteChatBtn) {
            deleteChatBtn.addEventListener('click', deleteCurrentChat);
        }

        if (clearAllChatsBtn) {
            clearAllChatsBtn.addEventListener('click', clearAllChats);
        }

        window.addEventListener('click', (e) => {
            if (e.target === settingsModal) {
                settingsModal.style.display = 'none';
            }
        });

        if (chats.length > 0) {
            selectChat(chats[0].id);
        } else {
            showWelcomeScreen();
        }
    }

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

    function loadTheme() {
        const saved = localStorage.getItem('scutoid_theme') || 'light';
        document.body.setAttribute('data-theme', saved);
        updateThemeIcon(saved);
    }

    function updateThemeIcon(theme) {
        const sun = document.querySelector('.sun-icon');
        const moon = document.querySelector('.moon-icon');
        if (theme === 'dark') {
            sun.style.display = 'none';
            moon.style.display = 'block';
        } else {
            sun.style.display = 'block';
            moon.style.display = 'none';
        }
    }

    function toggleTheme() {
        const currentTheme = document.body.getAttribute('data-theme');
        const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
        document.body.setAttribute('data-theme', newTheme);
        localStorage.setItem('scutoid_theme', newTheme);
        updateThemeIcon(newTheme);
    }

    function loadChats() {
        const stored = localStorage.getItem('scutoid_chats');
        if (stored) {
            chats = JSON.parse(stored);
            renderChatHistory();
        }
    }

    function saveChats() {
        localStorage.setItem('scutoid_chats', JSON.stringify(chats));
    }

    function renderChatHistory() {
        if (!chatHistoryContainer) return;

        // Clear existing chat history
        chatHistoryContainer.innerHTML = '';

        if (chats.length === 0) {
            chatHistoryContainer.innerHTML = '<div class="no-chats">No chats yet</div>';
            return;
        }

        // Create chat history items
        chats.forEach(chat => {
            const chatItem = document.createElement('div');
            chatItem.className = `chat-item ${chat.id === currentChatId ? 'active' : ''}`;
            chatItem.dataset.chatId = chat.id;

            const title = chat.messages.length > 0
                ? chat.messages[0].content.substring(0, 30) + (chat.messages[0].content.length > 30 ? '...' : '')
                : 'New Chat';

            chatItem.innerHTML = `
                <div class="chat-title">${title}</div>
                <div class="chat-time">${new Date(chat.createdAt).toLocaleString()}</div>
            `;

            chatItem.addEventListener('click', () => selectChat(chat.id));
            chatHistoryContainer.appendChild(chatItem);
});
    }

    function createNewChat() {
        const newChatId = Date.now().toString();
        const newChat = {
            id: newChatId,
            messages: [],
            createdAt: new Date().toISOString()
        };
        chats.push(newChat);
        currentChatId = newChatId;
        saveChats();
        renderChatHistory();
        clearChatContainer();
        showWelcomeScreen();
    }

    // ... [rest of the original functions] ...
});

