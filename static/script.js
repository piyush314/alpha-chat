import {fetchModelsFromOpenAI,sendMessageToOpenAI} from './llm_api.js';
import {loadChatsFromLocalStorage,storeChatsInLocalStorage,
  loadPromptsFromLocalStorage,storePromptsInLocalStorage,getApiKeyFromLocalStorage,
  storeApiKeyInLocalStorage} from './localStorage.js';
document.addEventListener('DOMContentLoaded', () => {
  // DOM Element References
  const chatList = document.getElementById('chat-list');
  const chatMessages = document.getElementById('chat-messages');
  const userInput = document.getElementById('user-input');
  const sendButton = document.getElementById('send-button');
  const newChatButton = document.getElementById('new-chat');
  const saveChatButton = document.getElementById('save-chat');
  const currentChatTitle = document.getElementById('current-chat-title');
  const apiKeyModal = document.getElementById('api-key-modal');
  const apiKeyInput = document.getElementById('api-key-input');
  const submitApiKeyButton = document.getElementById('submit-api-key');
  const modelSelect = document.getElementById('model-select');
  const addPromptButton = document.getElementById('add-prompt-button');
  const addPromptModal = document.getElementById('add-prompt-modal');
  const promptNameInput = document.getElementById('prompt-name-input');
  const promptContentInput = document.getElementById('prompt-content-input');
  const savePromptButton = document.getElementById('save-prompt-button');
  const promptList = document.getElementById('prompt-list');
  const promptContent = document.getElementById('prompt-content');
  const promptForm = document.getElementById('prompt-form');
  const dynamicInputArea = document.getElementById('dynamic-input-area');
  const defaultInput = document.getElementById('default-input');
  const promptInput = document.getElementById('prompt-input');
  const loadingIndicator = document.getElementById('loading-indicator');

  // Application State
  let currentChat = { id: Date.now(), title: 'New Chat', messages: [] };
  let chats = loadChatsFromLocalStorage() || [];
  let apiKey = getApiKeyFromLocalStorage();
  let selectedModel = 'gpt-3.5-turbo';
  let prompts = loadPromptsFromLocalStorage() || [];
  let currentInputMode = 'default';
  const defaultPrompt = { name: 'Default', content: '{{user-input}}', variables: ['user-input'] };
  let selectedPrompt = defaultPrompt;
  let isProcessing = false;

  // Initialize API Key Modal if needed
  if (!apiKey) {
    showApiKeyModal();
  }

  // API Key Submission Handler
  submitApiKeyButton.onclick = () => {
    apiKey = apiKeyInput.value.trim();
    if (apiKey) {
      storeApiKeyInLocalStorage(apiKey);
      hideApiKeyModal();
      fetchAvailableModels();
    }
  };

  // Model Fetching and Dropdown Population
  async function fetchAvailableModels() {
    try {
      const models = await fetchModelsFromOpenAI(apiKey);
      populateModelDropdown(models);
    } catch (error) {
      console.error('Error fetching models:', error);
    }
  }


  function populateModelDropdown(models) {
    modelSelect.innerHTML = '<option value="">Select a model</option>';
    models.forEach(model => {
      const option = document.createElement('option');
      option.value = model.id;
      option.textContent = model.id;
      modelSelect.appendChild(option);
    });
  }

  modelSelect.onchange = (e) => {
    selectedModel = e.target.value;
  };

  // Fetch Models if API Key Exists
  if (apiKey) {
    fetchAvailableModels();
  }

  // Chat List Management
  function updateChatList() {
    chatList.innerHTML = '';
    chats.forEach(chat => {
      const chatItem = createChatItem(chat);
      chatList.appendChild(chatItem);
    });
  }

  function createChatItem(chat) {
    const chatItem = document.createElement('div');
    chatItem.classList.add('chat-item');
    chatItem.textContent = chat.title;
    chatItem.onclick = () => loadChat(chat);
    return chatItem;
  }

  // Chat Loading
  function loadChat(chat) {
    currentChat = chat;
    currentChatTitle.textContent = chat.title;
    chatMessages.innerHTML = '';
    chat.messages.forEach(message => addMessage(message.sender, message.text));
  }

  const isMarkedAvailable = typeof marked !== 'undefined';

  if (!isMarkedAvailable) {
    console.warn('Marked library is not available. Markdown rendering will be disabled.');
  }

  // Custom renderer for marked
  const renderer = new marked.Renderer();
  renderer.text = function(text) {
    if (typeof text !== 'string') {
      console.warn('Received non-string text in renderer:', text);
      return String(text); // Convert to string if it's not already
    }

    const specialTags = [
      'missing_info',
      'logical_inconsistency',
      'undefined_concept',
      'assumed_prerequisite',
      'irrelevant_content',
      'flow_gap'
    ];

    specialTags.forEach(tag => {
      const regex = new RegExp(`<${tag}>(.+?)</${tag}>`, 'g');
      text = text.replace(regex, (match, p1) => 
        `<span class="special-tag ${tag.replace('_', '-')}">${p1}</span>`
      );
    });

    return text;
  };
  // Configure marked to use the custom renderer
  marked.use({ renderer });

  // Message Display
  function addMessage(sender, text) {
    console.log(`Adding message from ${sender}: ${text}`);
    const messageElement = document.createElement('div');
    messageElement.classList.add('message', `${sender}-message`);

    if (isMarkedAvailable) {
      try {
        // Parse and render the Markdown content
        let renderedContent = marked.parse(text);

        // Process special tags after Markdown rendering
        renderedContent = processSpecialTags(renderedContent);
        // Process maths 
        renderedContent = renderMath(renderedContent);

        messageElement.innerHTML = renderedContent;

        // Apply syntax highlighting to code blocks
        if (typeof hljs !== 'undefined') {
          messageElement.querySelectorAll('pre code').forEach((block) => {
            hljs.highlightElement(block);
          });
        }
      } catch (error) {
        console.error('Error parsing Markdown:', error);
        messageElement.textContent = text;
      }
    } else {
      // Fallback to plain text if Markdown parsing is not available
      messageElement.textContent = text;
    }

    chatMessages.appendChild(messageElement);
    scrollToBottom(chatMessages);
  }

  // Process special tags
  function processSpecialTags(content) {
    const specialTags = [
      'missing_info',
      'logical_inconsistency',
      'undefined_concept',
      'assumed_prerequisite',
      'irrelevant_content',
      'flow_gap'
    ];

    const regex = new RegExp(`<(${specialTags.join('|')})>(.+?)</\\1>`, 'g');
    return content.replace(regex, (match, tag, content) => 
      `<span class="special-tag ${tag.replace('_', '-')}">${content}</span>`
    );
  }

  // render maths and equations
  function renderMath(content) {
    return content.replace(/\$\$(.*?)\$\$/g, (match, p1) => {
      return katex.renderToString(p1, {throwOnError: false});
    });
  }

  function scrollToBottom(element) {
    element.scrollTop = element.scrollHeight;
  }

  // Chat Saving
  function saveCurrentChat() {
    const existingIndex = chats.findIndex(chat => chat.id === currentChat.id);
    if (existingIndex !== -1) {
      chats[existingIndex] = currentChat;
    } else {
      chats.push(currentChat);
    }
    storeChatsInLocalStorage(chats);
    updateChatList();
  }

  // New Chat Button Handler
  newChatButton.onclick = () => {
    currentChat = { id: Date.now(), title: 'New Chat', messages: [] };
    currentChatTitle.textContent = 'New Chat';
    chatMessages.innerHTML = '';
    setInputMode('default');
  };

  // Save Chat Button Handler
  saveChatButton.onclick = () => {
    const title = prompt('Enter a title for this chat:', currentChat.title);
    if (title) {
      currentChat.title = title;
      currentChatTitle.textContent = title;
      saveCurrentChat();
    }
  };

  // Add Prompt Button Handler
  addPromptButton.onclick = () => {
    showAddPromptModal();
  };

  // Save Prompt Button Handler
  savePromptButton.onclick = () => {
    const name = promptNameInput.value.trim();
    const content = promptContentInput.value.trim();
    if (name && content) {
      const newPrompt = { name, content, variables: parseVariables(content) };
      prompts.push(newPrompt);
      storePromptsInLocalStorage(prompts);
      updatePromptList();
      hideAddPromptModal();
      clearAddPromptForm();
    }
  };

  // Parse Variables from Prompt Content
  function parseVariables(content) {
    const regex = /{{(\w+)}}/g;
    const variables = new Set();
    let match;
    while ((match = regex.exec(content)) !== null) {
      variables.add(match[1]);
    }
    return Array.from(variables);
  }

  // Update Prompt List
  function updatePromptList() {
    promptList.innerHTML = '';
    prompts.forEach(prompt => {
      const promptItem = createPromptItem(prompt);
      promptList.appendChild(promptItem);
    });
  }

  // Create Prompt Item
  function createPromptItem(prompt) {
    const promptItem = document.createElement('div');
    promptItem.classList.add('prompt-item');
    promptItem.textContent = prompt.name;
    promptItem.onclick = () => selectPrompt(prompt);
    return promptItem;
  }

  // Select Prompt
  function selectPrompt(prompt) {
    selectedPrompt = prompt;
    promptContent.textContent = prompt.content;
    generatePromptForm(prompt.variables);
    setInputMode(prompt.variables.length > 1 ? 'prompt' : 'default');
  }

  // Generate Prompt Form
  function generatePromptForm(variables) {
    promptForm.innerHTML = '';
    variables.forEach((variable, index) => {
      const input = document.createElement('input');
      input.type = 'text';
      input.id = `var-${variable}`;
      input.placeholder = variable;
      input.className = 'prompt-input-field';
      if (index === 0) input.autofocus = true;
      promptForm.appendChild(input);
    });
  }

  // Set Input Mode
  function setInputMode(mode) {
    currentInputMode = mode;
    defaultInput.classList.toggle('active', mode === 'default');
    promptInput.classList.toggle('active', mode === 'prompt');
  }

  // Send Button Handler
  sendButton.onclick = async () => {
    if (isProcessing) return;

    let message;
    if (currentInputMode === 'default') {
      message = userInput.value;
    } else {
      message = constructPromptMessage();
    }

    if (message) {
      setProcessingState(true);
      try {
        addMessage('user', message); // This will now render Markdown
        currentChat.messages.push({ sender: 'user', text: message });
        clearInputs();

        const response = await sendMessageToOpenAI(message, selectedModel, apiKey);
        addMessage('bot', response); // This will now render Markdown
        currentChat.messages.push({ sender: 'bot', text: response });
      } catch (error) {
        console.error('Error in send process:', error);
        addMessage('bot', 'Sorry, I encountered an error. Please try again.');
      } finally {
        setProcessingState(false);
      }
    }
  };
  
  // Construct Prompt Message
  function constructPromptMessage() {
    let promptText = selectedPrompt.content;
    selectedPrompt.variables.forEach(variable => {
      const input = document.getElementById(`var-${variable}`);
      promptText = promptText.replace(`{{${variable}}}`, input.value.trim());
    });
    return promptText;
  }

  // Clear Inputs
  function clearInputs() {
    userInput.value = '';
    promptForm.reset();
  }

  // Set Processing State
  function setProcessingState(processing) {
    isProcessing = processing;
    sendButton.disabled = processing;
    loadingIndicator.classList.toggle('hidden', !processing);
  }


  // Modal Helpers
  function showApiKeyModal() {
    apiKeyModal.style.display = 'block';
  }

  function hideApiKeyModal() {
    apiKeyModal.style.display = 'none';
  }

  function showAddPromptModal() {
    addPromptModal.style.display = 'block';
  }

  function hideAddPromptModal() {
    addPromptModal.style.display = 'none';
  }

  function clearAddPromptForm() {
    promptNameInput.value = '';
    promptContentInput.value = '';
  }

  // // Local Storage Helpers
  // function loadChatsFromLocalStorage() {
  //   return JSON.parse(localStorage.getItem('chats'));
  // }

  // function storeChatsInLocalStorage(chats) {
  //   localStorage.setItem('chats', JSON.stringify(chats));
  // }

  // function loadPromptsFromLocalStorage() {
  //   return JSON.parse(localStorage.getItem('prompts'));
  // }

  // function storePromptsInLocalStorage(prompts) {
  //   localStorage.setItem('prompts', JSON.stringify(prompts));
  // }

  // function getApiKeyFromLocalStorage() {
  //   return localStorage.getItem('openai_api_key');
  // }

  // function storeApiKeyInLocalStorage(apiKey) {
  //   localStorage.setItem('openai_api_key', apiKey);
  // }

  // Initialize the application
  updateChatList();
  updatePromptList();

  // Enter Keypress Handler
  userInput.onkeypress = (e) => {
    if (e.key === 'Enter' && !isProcessing) sendButton.onclick();
  };
});