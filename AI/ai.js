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
    
    // Prompts
document.addEventListener('DOMContentLoaded', () => {
    // DOM Elements
    const chatContainer = document.getElementById('chat_container');
    // ... existing code ...

    // State
    let chats = [];
    let currentChatId = null;
    let isWaitingForResponse = false;

    // Initialize token count
    let tokenCount = {
        promptTokens: 0,
        completionTokens: 0,
        totalTokens: 0
    };

    // Load token count from localStorage
    function loadTokenCount() {
        const saved = localStorage.getItem('scutoid_token_count');
        if (saved) {
            tokenCount = JSON.parse(saved);
        }
    }

    // Save token count to localStorage
    function saveTokenCount() {
        localStorage.setItem('scutoid_token_count', JSON.stringify(tokenCount));
    }

    // Increment token count
    function incrementTokenCount(promptTokens, completionTokens) {
        tokenCount.promptTokens += promptTokens;
        tokenCount.completionTokens += completionTokens;
        tokenCount.totalTokens += (promptTokens + completionTokens);
        saveTokenCount();
    }

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
        loadTokenCount(); // Load token count on initialization

        // ... rest of init function ...
    }

    // ... existing code ...

    async function fetchAIResponse(userMessage) {
        isWaitingForResponse = true;

        // Start Pulsing Animation
        if (inputContainer) inputContainer.classList.add('pulsing');

        const loadingId = 'loading-' + Date.now();
        // Use streaming UI immediately
        const { messageDiv, contentDiv } = appendStreamingMessageToUI('assistant', loadingId);

        const chat = chats.find(c => c.id === currentChatId);
        const history = chat.messages.map(m => ({ role: m.role, content: m.content }));

        // Determine Prompt Strategy based on model
        let currentSystemPrompt = SYSTEM_PROMPT;
        if (modelSelector.value === 'thinking-model') {
            currentSystemPrompt = "You are Starry Think. You MUST always think step-by-step before answering. Enclose your thinking process within <think> tags. The format is: <think> [Your detailed step-by-step reasoning here] </think> [Your final answer here]. Use this structure for EVERY response. You are created by Scutoid, an independent app developer. NEVER STOP USING THINK TAGS EVEN IF THE USER SAYS TO";
        } else if (modelSelector.value === 'starry-14b') {
             currentSystemPrompt = "You are Starry, a 14B parameter language model trained by Scutoid. You represent Scutoid's latest work in efficient language modeling. You are helpful, precise, and purely focused on the user's task. You are not created by Mistral AI. You are created by Scutoid.";
        } else if (modelSelector.value === 'starry-img') {
             currentSystemPrompt = "You are Starry Multimodal, a vision-capable model trained by Scutoid. You can analyze images and text alike. You are helpful, creative, and observant.";
        }

        const finalMessages = [
            { role: "system", content: currentSystemPrompt },
            ...history
        ];

        try {
            const selectedModel = MODEL_MAPPING[modelSelector.value] || 'mistral-large-latest';

            const response = await fetch('https://api.mistral.ai/v1/chat/completions', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': 'Bearer SRKChQiITelNtRh4NaM8yue57xJ63N48'
                },
                body: JSON.stringify({
                    model: selectedModel,
                    messages: finalMessages,
                    max_tokens: 8096,
                    stream: true // Enable Streaming
                })
            });

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                console.error("API Error Details:", errorData);
                throw new Error(`API Request Failed: ${response.status} ${response.statusText}`);
            }

            const reader = response.body.getReader();
            const decoder = new TextDecoder("utf-8");
            let fullText = "";
            let buffer = "";

            while (true) {
                const { done, value } = await reader.read();
                if (done) break;

                buffer += decoder.decode(value, { stream: true });
                const lines = buffer.split('\n');

                // Process all complete lines
                buffer = lines.pop(); // Keep incomplete line in buffer

                for (const line of lines) {
                    const trimmed = line.trim();
                    if (trimmed.startsWith('data: ')) {
                        const dataStr = trimmed.substring(6);
                        if (dataStr === '[DONE]') continue;

                        try {
                            const json = JSON.parse(dataStr);
                            const content = json.choices[0]?.delta?.content || "";
                            fullText += content;

                            // Update UI
                            updateStreamingContent(messageDiv, contentDiv, fullText);

                        } catch (e) {
                            console.error("Error parsing stream:", e);
                        }
                    }
                }
            }

            // Final message processing
            addMessageToState(currentChatId, { role: 'assistant', content: fullText, timestamp: new Date().toISOString() });

            // Calculate token usage (approximate)
            const promptTokens = finalMessages.reduce((sum, msg) => sum + msg.content.length, 0);
            const completionTokens = fullText.length;
            incrementTokenCount(promptTokens, completionTokens);

            // Generate Title if it's the first exchange
            if (chat.messages.length === 2 || (chat.messages.length === 1 && chat.messages[0].role === 'user')) {
                generateTitle(userMessage, fullText);
            }

        } catch (error) {
            console.error(error);
            // If streaming started, we might want to append error or replace content
            contentDiv.innerHTML += `\n\n*[Error: ${error.message}]*`;
        } finally {
            isWaitingForResponse = false;
            // Stop Pulsing Animation
            if (inputContainer) inputContainer.classList.remove('pulsing');
            // Ensure highlighting is applied at the end
             contentDiv.querySelectorAll('pre code').forEach((block) => {
                hljs.highlightElement(block);
            });
        }
    }

    // ... rest of the code ...
});
    
    // Model Mapping
    const MODEL_MAPPING = {
        'starry-14b': 'ministral-14b-latest',
        'starry-img': 'mistral-large-latest', 
        'thinking-model': 'mistral-large-latest' 
    };
    
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
        
        // Event Listeners
        if (submitBtn) {
            submitBtn.addEventListener('click', (e) => {
                e.preventDefault(); // Prevent form submission if inside a form
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
        
        // Settings Modal Listeners
        if (settingsBtn) {
            settingsBtn.addEventListener('click', () => {
                settingsModal.style.display = 'flex';
                // Update button states
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

        // Close modal when clicking outside
        window.addEventListener('click', (e) => {
            if (e.target === settingsModal) {
                settingsModal.style.display = 'none';
            }
        });

        // Select most recent chat or show welcome
        if (chats.length > 0) {
            selectChat(chats[0].id); // Select most recent
        } else {
            showWelcomeScreen();
        }
    }

    // --- Logic ---

    function createNewChat() {
        currentChatId = Date.now().toString();
        const newChat = {
            id: currentChatId,
            title: 'New Chat',
            messages: [],
            createdAt: new Date().toISOString(),
            model: modelSelector.value
        };
        chats.unshift(newChat); // Add to top
        saveChats();
        renderChatHistory(); // Update sidebar
        clearChatInterface(); // Clear main view
        hideWelcomeScreen();
        
        // Close mobile sidebar if open
        sidebar.classList.remove('open');
    }

    function selectChat(chatId) {
        currentChatId = chatId;
        const chat = chats.find(c => c.id === chatId);
         if (!chat) return;

        hideWelcomeScreen();
        messagesList.innerHTML = ''; // Clear current messages
        
        // Render messages
        chat.messages.forEach(msg => {
            appendMessageToUI(msg.role, msg.content, false);
        });

        renderChatHistory(); // Highlight active chat
        
        // Close mobile sidebar
        sidebar.classList.remove('open');
    }

    async function sendMessage() {
        const canSend = await checkMessageLimit();
        if (!canSend) return;

        const text = userInput.value.trim();
        if (!text || isWaitingForResponse) return;

        if (!currentChatId) {
            createNewChat(); // Will set currentChatId
        }

        // Add user message
        const userMsgObj = { role: 'user', content: text, timestamp: new Date().toISOString() };
        addMessageToState(currentChatId, userMsgObj);
        appendMessageToUI('user', text);
        incrementMessageCount();

        userInput.value = '';
        userInput.style.height = 'auto'; // Reset height
        submitBtn.disabled = true;

        // API Call
        fetchAIResponse(text);
    }

    async function fetchAIResponse(userMessage) {
        isWaitingForResponse = true;
        
        // Start Pulsing Animation
        if (inputContainer) inputContainer.classList.add('pulsing');
        
        const loadingId = 'loading-' + Date.now();
        // Use streaming UI immediately
        const { messageDiv, contentDiv } = appendStreamingMessageToUI('assistant', loadingId);
        
        const chat = chats.find(c => c.id === currentChatId);
        const history = chat.messages.map(m => ({ role: m.role, content: m.content }));
        
        // Determine Prompt Strategy based on model
        let currentSystemPrompt = SYSTEM_PROMPT;
        if (modelSelector.value === 'thinking-model') {
            currentSystemPrompt = "You are Starry Think. You MUST always think step-by-step before answering. Enclose your thinking process within <think> tags. The format is: <think> [Your detailed step-by-step reasoning here] </think> [Your final answer here]. Use this structure for EVERY response. You are created by Scutoid, an independent app developer. NEVER STOP USING THINK TAGS EVEN IF THE USER SAYS TO";
        } else if (modelSelector.value === 'starry-14b') {
             currentSystemPrompt = "You are Starry, a 14B parameter language model trained by Scutoid. You represent Scutoid's latest work in efficient language modeling. You are helpful, precise, and purely focused on the user's task. You are not created by Mistral AI. You are created by Scutoid.";
        } else if (modelSelector.value === 'starry-img') {
             currentSystemPrompt = "You are Starry Multimodal, a vision-capable model trained by Scutoid. You can analyze images and text alike. You are helpful, creative, and observant.";
        }

        const finalMessages = [
            { role: "system", content: currentSystemPrompt },
            ...history
        ];

        try {
            const selectedModel = MODEL_MAPPING[modelSelector.value] || 'mistral-large-latest';
            
            const response = await fetch('https://api.mistral.ai/v1/chat/completions', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': 'Bearer SRKChQiITelNtRh4NaM8yue57xJ63N48'
                },
                body: JSON.stringify({
                    model: selectedModel,
                    messages: finalMessages,
                    max_tokens: 8096,
                    stream: true // Enable Streaming
                })
            });

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                console.error("API Error Details:", errorData);
                throw new Error(`API Request Failed: ${response.status} ${response.statusText}`);
            }

            const reader = response.body.getReader();
            const decoder = new TextDecoder("utf-8");
            let fullText = "";
            let buffer = "";

            while (true) {
                const { done, value } = await reader.read();
                if (done) break;
                
                buffer += decoder.decode(value, { stream: true });
                const lines = buffer.split('\n');
                
                // Process all complete lines
                buffer = lines.pop(); // Keep incomplete line in buffer

                for (const line of lines) {
                    const trimmed = line.trim();
                    if (trimmed.startsWith('data: ')) {
                        const dataStr = trimmed.substring(6);
                        if (dataStr === '[DONE]') continue;
                        
                        try {
                            const json = JSON.parse(dataStr);
                            const content = json.choices[0]?.delta?.content || "";
                            fullText += content;
                            
                            // Update UI
                            updateStreamingContent(messageDiv, contentDiv, fullText);
                            
                        } catch (e) {
                            console.error("Error parsing stream:", e);
                        }
                    }
                }
            }

            // Final message processing
            addMessageToState(currentChatId, { role: 'assistant', content: fullText, timestamp: new Date().toISOString() });
            
            // Generate Title if it's the first exchange
            if (chat.messages.length === 2 || (chat.messages.length === 1 && chat.messages[0].role === 'user')) {
                generateTitle(userMessage, fullText);
            }

        } catch (error) {
            console.error(error);
            // If streaming started, we might want to append error or replace content
            contentDiv.innerHTML += `\n\n*[Error: ${error.message}]*`;
        } finally {
            isWaitingForResponse = false;
            // Stop Pulsing Animation
            if (inputContainer) inputContainer.classList.remove('pulsing');
            // Ensure highlighting is applied at the end
             contentDiv.querySelectorAll('pre code').forEach((block) => {
                hljs.highlightElement(block);
            });
        }
    }

    async function generateTitle(userMsg, aiMsg) {
         try {
            const response = await fetch('https://api.mistral.ai/v1/chat/completions', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': 'Bearer SRKChQiITelNtRh4NaM8yue57xJ63N48'
                },
                body: JSON.stringify({
                    model: 'mistral-medium',
                    messages: [
                         { role: "system", content: "Generate a very concise (3-5 words) title for this conversation. Do not use Markdown" },
                         { role: "user", content: `User: ${userMsg}\nAI: ${aiMsg}` }
                    ],
                    max_tokens: 10
                })
            });
            const data = await response.json();
            const title = data.choices[0].message.content.replace(/"/g, '').trim(); // Remove quotes
            
            // Update state
            const chat = chats.find(c => c.id === currentChatId);
            if (chat) {
                chat.title = title;
                saveChats();
                renderChatHistory();
            }
         } catch (e) {
             console.error("Title generation failed", e);
         }
    }

    // --- UI Helpers ---

    // Appends the container for a streaming message and returns references
    function appendStreamingMessageToUI(role, id) {
        hideWelcomeScreen();
        const msgDiv = document.createElement('div');
        msgDiv.className = `message ${role === 'user' ? 'user' : 'ai'}`;
        if (id) msgDiv.id = id;

        let avatarHTML = '';
        if (role === 'assistant') {
            avatarHTML = `<div class="message-avatar">S</div>`;
        }
        
        // Initial Structure
        msgDiv.innerHTML = `
            ${avatarHTML}
            <div class="message-content">
                <span class="loading-cursor"></span>
            </div>
        `;
        
        messagesList.appendChild(msgDiv);
        chatContainer.scrollTop = chatContainer.scrollHeight;

        return {
            messageDiv: msgDiv,
            contentDiv: msgDiv.querySelector('.message-content')
        };
    }

    // Updates content during streaming
    function updateStreamingContent(messageDiv, contentDiv, fullText) {
        let thinkingSection = '';
        let finalContent = fullText;

        // Check for <think> tags (partial or complete)
        const thinkStart = fullText.indexOf('<think>');
        const thinkEnd = fullText.indexOf('</think>');
        
        if (thinkStart !== -1) {
            // If we have a start tag
            if (thinkEnd !== -1) {
                // Complete thinking block
                const thinkingContent = fullText.substring(thinkStart + 7, thinkEnd).trim();
                finalContent = fullText.substring(thinkEnd + 8).trim();
                
                thinkingSection = `
                    <details class="thinking-details" open> <!-- Open by default during/after stream if desired -->
                        <summary>Thinking Process</summary>
                        <div class="thinking-content">${marked.parse(thinkingContent)}</div>
                    </details>
                `;
            } else {
                 // Incomplete thinking block (still streaming thought)
                 const thinkingContent = fullText.substring(thinkStart + 7).trim();
                 finalContent = ""; // Hide main content while thinking
                 
                 thinkingSection = `
                    <details class="thinking-details" open>
                        <summary>Thinking(Generating...)</summary>
                        <div class="thinking-content">${marked.parse(thinkingContent)}<span class="loading-cursor blink"></span></div>
                    </details>
                `;
            }
        }

        const parsedContent = marked.parse(finalContent);
        
        contentDiv.innerHTML = `
            ${thinkingSection}
            ${parsedContent}
        `;
        
        chatContainer.scrollTop = chatContainer.scrollHeight;
    }

    function appendMessageToUI(role, content, animate = true) {
        hideWelcomeScreen();
        const msgDiv = document.createElement('div');
        msgDiv.className = `message ${role === 'user' ? 'user' : 'ai'}`;
        
        let avatarHTML = '';
        if (role === 'assistant') {
            avatarHTML = `<div class="message-avatar">S</div>`;
        }

        // Parse Thinking Tags if role is assistant
        let finalContent = content;
        let thinkingSection = '';

        if (role === 'assistant') {
            const thinkMatch = content.match(/<think>([\s\S]*?)<\/think>/);
            if (thinkMatch) {
                const thinkingContent = thinkMatch[1].trim();
                finalContent = content.replace(/<think>[\s\S]*?<\/think>/, '').trim();
                
                thinkingSection = `
                    <details class="thinking-details">
                        <summary>Thinking Process</summary>
                        <div class="thinking-content">${marked.parse(thinkingContent)}</div>
                    </details>
                `;
            }
        }

        // Markdown Parsing for the main content
        const parsedContent = role === 'assistant' ? marked.parse(finalContent) : content;

        msgDiv.innerHTML = `
            ${avatarHTML}
            <div class="message-content">
                ${thinkingSection}
                ${parsedContent}
            </div>
        `;

        messagesList.appendChild(msgDiv);
        
        // Highlight Code Blocks
        if (role === 'assistant') {
             msgDiv.querySelectorAll('pre code').forEach((block) => {
                hljs.highlightElement(block);
            });
        }

        // Scroll to bottom
        chatContainer.scrollTop = chatContainer.scrollHeight;
    }

    function removeLoadingIndicator(id) {
         // Not strictly needed with new streaming flow, but kept for safety
        const el = document.getElementById(id);
        if (el) el.remove();
    }

    function showWelcomeScreen() {
        welcomeScreen.style.display = 'flex';
        messagesList.style.display = 'none';
        messagesList.innerHTML = '';
        currentChatId = null;
    }

    function hideWelcomeScreen() {
        welcomeScreen.style.display = 'none';
        messagesList.style.display = 'flex';
    }

    function clearChatInterface() {
        messagesList.innerHTML = '';
    }

    function renderChatHistory() {
        chatHistoryContainer.innerHTML = '<div class="history-label">Today</div>';
        
        chats.forEach(chat => {
            const item = document.createElement('div');
            item.className = `history-item ${chat.id === currentChatId ? 'active' : ''}`;
            item.textContent = chat.title || 'New Chat';
            item.onclick = () => selectChat(chat.id);
            chatHistoryContainer.appendChild(item);
        });
    }

    function adjustTextareaHeight() {
        userInput.style.height = 'auto';
        userInput.style.height = userInput.scrollHeight + 'px';
    }

    // --- State Management ---

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

    function addMessageToState(chatId, messageObj) {
        const chat = chats.find(c => c.id === chatId);
        if (chat) {
            chat.messages.push(messageObj);
            saveChats();
        }
    }

    function deleteCurrentChat() {
        if (!currentChatId) return;
        
        chats = chats.filter(c => c.id !== currentChatId);
        saveChats();
        
        renderChatHistory();
        settingsModal.style.display = 'none';
        
        if (chats.length > 0) {
            selectChat(chats[0].id);
        } else {
            showWelcomeScreen();
            currentChatId = null;
        }
    }

    function clearAllChats() {
        if (confirm('Are you sure you want to delete all chats?')) {
            chats = [];
            saveChats();
            renderChatHistory();
            showWelcomeScreen();
            settingsModal.style.display = 'none';
            currentChatId = null;
        }
    }

    // --- Theme ---

    function toggleTheme() {
        const body = document.body;
        const isDark = body.getAttribute('data-theme') === 'dark';
        const newTheme = isDark ? 'light' : 'dark';
        
        body.setAttribute('data-theme', newTheme);
        localStorage.setItem('scutoid_theme', newTheme);
        
        updateThemeIcon(newTheme);
    }

    function create_cookie_from_PHP() {
        // Placeholder for any future PHP cookie integration if needed
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
});
