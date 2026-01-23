// System Prompts for each model
const SYSTEM_PROMPTS = {
    'starry-14b': "You are Starry-14B, a helpful AI assistant created by Scutoid. You are designed to be helpful, informative, and friendly while assisting users with their questions and tasks. Keep your responses clear and professional, using emojis sparingly or not at all. Focus on delivering accurate and concise information. You are not created by Mistral AI, Google, or OpenAI.",
    
    'starry-img': "You are Starry Multimodal, a helpful AI assistant created by Scutoid with advanced image understanding capabilities. You are designed to be helpful, informative, and friendly while assisting users with their questions and tasks, including analyzing and discussing images. Keep your responses clear and professional, using emojis sparingly or not at all. Focus on delivering accurate and concise information. You are not created by Mistral AI, Google, or OpenAI.",
    
    'thinking-model': "You are Starry Think, an advanced reasoning AI assistant created by Scutoid. You are designed to think deeply and systematically about problems before responding. Always show your thinking process step-by-step, breaking down complex problems into smaller parts, considering multiple approaches, and reasoning through solutions carefully. Use chain-of-thought reasoning for every response, no matter how simple the question. Keep your responses clear and professional, using emojis sparingly or not at all. Focus on delivering accurate, well-reasoned, and concise information. You are not created by Mistral AI, Google, or OpenAI. Show thinking by using <think> and </think> tags."
};

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

    function adjustTextareaHeight() {
        userInput.style.height = 'auto';
        userInput.style.height = Math.min(userInput.scrollHeight, 200) + 'px';
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

        chatHistoryContainer.innerHTML = '';

        if (chats.length === 0) {
            chatHistoryContainer.innerHTML = '<div class="no-chats">No chats yet</div>';
            return;
        }

        chats.forEach(chat => {
            const chatItem = document.createElement('div');
            chatItem.className = `history-item ${chat.id === currentChatId ? 'active' : ''}`;
            chatItem.dataset.chatId = chat.id;

            const title = chat.messages.length > 0
                ? chat.messages[0].content.substring(0, 30) + (chat.messages[0].content.length > 30 ? '...' : '')
                : 'New Chat';

            chatItem.textContent = title;
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
        chats.unshift(newChat);
        currentChatId = newChatId;
        saveChats();
        renderChatHistory();
        clearChatContainer();
        showWelcomeScreen();
    }

    function selectChat(chatId) {
        currentChatId = chatId;
        const chat = chats.find(c => c.id === chatId);
        if (chat) {
            renderMessages(chat.messages);
            renderChatHistory();
        }
    }

    function showWelcomeScreen() {
        if (welcomeScreen) {
            welcomeScreen.style.display = 'flex';
        }
        messagesList.innerHTML = '';
    }

    function hideWelcomeScreen() {
        if (welcomeScreen) {
            welcomeScreen.style.display = 'none';
        }
    }

    function clearChatContainer() {
        messagesList.innerHTML = '';
        showWelcomeScreen();
    }

    function renderMessages(messages) {
        hideWelcomeScreen();
        messagesList.innerHTML = '';
        messages.forEach(msg => {
            addMessageToUI(msg.role, msg.content);
        });
        scrollToBottom();
    }

    function addMessageToUI(role, content) {
        hideWelcomeScreen();
        
        const messageDiv = document.createElement('div');
        messageDiv.className = `message ${role}`;

        if (role === 'assistant') {
            messageDiv.innerHTML = `
                <div class="message-avatar">S</div>
                <div class="message-content">${marked.parse(content)}</div>
            `;
        } else {
            messageDiv.innerHTML = `
                <div class="message-content">${content}</div>
            `;
        }

        messagesList.appendChild(messageDiv);
        
        // Highlight code blocks
        messageDiv.querySelectorAll('pre code').forEach((block) => {
            hljs.highlightElement(block);
        });
        
        scrollToBottom();
    }

    function scrollToBottom() {
        chatContainer.scrollTop = chatContainer.scrollHeight;
    }

    async function sendMessage() {
        if (isWaitingForResponse) return;
        
        const message = userInput.value.trim();
        if (!message) return;

        // Check message limit
        const canSend = await checkMessageLimit();
        if (!canSend) return;

        // Get or create current chat
        if (!currentChatId) {
            createNewChat();
        }

        const chat = chats.find(c => c.id === currentChatId);
        if (!chat) return;

        // Add user message
        chat.messages.push({ role: 'user', content: message });
        addMessageToUI('user', message);
        saveChats();
        renderChatHistory();

        // Clear input
        userInput.value = '';
        adjustTextareaHeight();
        submitBtn.disabled = true;

        // Show loading state
        isWaitingForResponse = true;
        inputContainer.classList.add('pulsing');

        // Increment message count
        incrementMessageCount();

        try {
            const selectedModel = modelSelector.value;
            const apiModel = MODEL_MAPPING[selectedModel] || MODEL_MAPPING['starry-14b'];
            const systemPrompt = SYSTEM_PROMPTS[selectedModel] || SYSTEM_PROMPTS['starry-14b'];

            // Prepare messages for API with system message
            const apiMessages = [
                { role: 'system', content: systemPrompt },
                ...chat.messages.map(msg => ({
                    role: msg.role === 'assistant' ? 'assistant' : 'user',
                    content: msg.content
                }))
            ];

            const response = await fetch('https://api.mistral.ai/v1/chat/completions', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': 'Bearer oJ5CNcZOMsvzv3YXzq0FfX5I5sNZ6cwP'
                },
                body: JSON.stringify({
                    model: apiModel,
                    messages: apiMessages,
                    temperature: 0.7,
                    max_tokens: 1000,
                    safe_prompt: false,
                    stream: true
                })
            });

            if (!response.ok) {
                const errorData = await response.json();
                console.error('API error details:', errorData);
                throw new Error(`API error: ${response.status}`);
            }

            // Create a message element for streaming
            const messageDiv = document.createElement('div');
            messageDiv.className = 'message assistant';
            messageDiv.innerHTML = `
                <div class="message-avatar">S</div>
                <div class="message-content"></div>
            `;
            messagesList.appendChild(messageDiv);
            const contentDiv = messageDiv.querySelector('.message-content');
            
            let fullResponse = '';
            const reader = response.body.getReader();
            const decoder = new TextDecoder();

            while (true) {
                const { done, value } = await reader.read();
                if (done) break;

                const chunk = decoder.decode(value);
                const lines = chunk.split('\n');

                for (const line of lines) {
                    if (line.startsWith('data: ')) {
                        const data = line.slice(6);
                        if (data === '[DONE]') continue;

                        try {
                            const parsed = JSON.parse(data);
                            const content = parsed.choices[0]?.delta?.content;
                            if (content) {
                                fullResponse += content;
                                contentDiv.innerHTML = marked.parse(fullResponse);
                                
                                // Highlight code blocks
                                contentDiv.querySelectorAll('pre code').forEach((block) => {
                                    hljs.highlightElement(block);
                                });
                                
                                scrollToBottom();
                            }
                        } catch (e) {
                            // Skip invalid JSON
                        }
                    }
                }
            }

            // Add AI response to chat history
            chat.messages.push({ role: 'assistant', content: fullResponse });
            saveChats();
            renderChatHistory();

        } catch (error) {
            console.error('Error sending message:', error);
            addMessageToUI('assistant', 'Sorry, I encountered an error. Please try again.');
        } finally {
            isWaitingForResponse = false;
            inputContainer.classList.remove('pulsing');
        }
    }

    function deleteCurrentChat() {
        if (!currentChatId) return;
        
        if (confirm('Are you sure you want to delete this chat?')) {
            chats = chats.filter(c => c.id !== currentChatId);
            saveChats();
            
            if (chats.length > 0) {
                selectChat(chats[0].id);
            } else {
                currentChatId = null;
                clearChatContainer();
            }
            
            renderChatHistory();
            settingsModal.style.display = 'none';
        }
    }

    function clearAllChats() {
        if (confirm('Are you sure you want to delete all chats? This cannot be undone.')) {
            chats = [];
            currentChatId = null;
            saveChats();
            clearChatContainer();
            renderChatHistory();
            settingsModal.style.display = 'none';
        }
    }
});