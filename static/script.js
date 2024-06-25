import { fetchModelsFromOpenAI, sendMessageToOpenAI } from './llm_api.js';
import {
   storeChatsInLocalStorage,
  storeApiKeyInLocalStorage
} from './localStorage.js';

import { domElements } from './dom_elements.js';
import  state  from './state.js'; 
import { showAddPromptModal, savePromptButtonHandler } from './addNewPrompt.js';
import { updatePromptList } from './promptUI.js';
import { addMessage } from './chatRender.js';  // Import addMessage function


document.addEventListener('DOMContentLoaded', () => {

  const { chatList, chatMessages, userInput, sendButton, newChatButton, saveChatButton,
     currentChatTitle, apiKeyModal, apiKeyInput, 
     submitApiKeyButton, modelSelect, addPromptButton, addPromptModal, 
     promptNameInput, promptContentInput, savePromptButton, promptList, 
     promptContent, promptForm, dynamicInputArea, defaultInput, 
     promptInput, loadingIndicator } = domElements;



  // Initialize API Key Modal if needed
  if (!state.apiKey) {
    showApiKeyModal();
  }

  // API Key Submission Handler
  submitApiKeyButton.onclick = () => {
    state.apiKey = apiKeyInput.value.trim();
    if (state.apiKey) {
      storeApiKeyInLocalStorage(state.apiKey);
      hideApiKeyModal();
      fetchAvailableModels();
    }
  };

  // Model Fetching and Dropdown Population
  async function fetchAvailableModels() {
    try {
      const models = await fetchModelsFromOpenAI(state.apiKey);
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
    state.selectedModel = e.target.value;
  };

  // Fetch Models if API Key Exists
  if (state.apiKey) {
    fetchAvailableModels();
  }

  // Chat List Management
  function updateChatList() {
    chatList.innerHTML = '';
    state.chats.forEach(chat => {
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
    state.currentChat = chat;
    currentChatTitle.textContent = chat.title;
    chatMessages.innerHTML = '';
    chat.messages.forEach(message => addMessage(message.sender, message.text, chatMessages));
  }

  const isMarkedAvailable = typeof marked !== 'undefined';

  if (!isMarkedAvailable) {
    console.warn('Marked library is not available. Markdown rendering will be disabled.');
  }

  // Custom renderer for marked
  const renderer = new marked.Renderer();
  renderer.text = function (text) {
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
  // function addMessage(sender, text) {
  //   console.log(`Adding message from ${sender}: ${text}`);
  //   const messageElement = document.createElement('div');
  //   messageElement.classList.add('message', `${sender}-message`);

  //   if (isMarkedAvailable) {
  //     try {
  //       // Parse and render the Markdown content
  //       let renderedContent = marked.parse(text);

  //       // Process special tags after Markdown rendering
  //       renderedContent = processSpecialTags(renderedContent);
  //       // Process maths 
  //       renderedContent = renderMath(renderedContent);

  //       messageElement.innerHTML = renderedContent;

  //       // Apply syntax highlighting to code blocks
  //       if (typeof hljs !== 'undefined') {
  //         messageElement.querySelectorAll('pre code').forEach((block) => {
  //           hljs.highlightElement(block);
  //         });
  //       }
  //     } catch (error) {
  //       console.error('Error parsing Markdown:', error);
  //       messageElement.textContent = text;
  //     }
  //   } else {
  //     // Fallback to plain text if Markdown parsing is not available
  //     messageElement.textContent = text;
  //   }

  //   chatMessages.appendChild(messageElement);
  //   scrollToBottom(chatMessages);
  // }

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
      return katex.renderToString(p1, { throwOnError: false });
    });
  }

  function scrollToBottom(element) {
    element.scrollTop = element.scrollHeight;
  }

  // Chat Saving
  function saveCurrentChat() {
    const existingIndex = state.chats.findIndex(chat => chat.id === state.currentChat.id);
    if (existingIndex !== -1) {
      state.chats[existingIndex] = state.currentChat;
    } else {
      state.chats.push(state.currentChat);
    }
    storeChatsInLocalStorage(state.chats);
    updateChatList();
  }

  // New Chat Button Handler
  newChatButton.onclick = () => {
    state.currentChat = { id: Date.now(), title: 'New Chat', messages: [] };
    currentChatTitle.textContent = 'New Chat';
    chatMessages.innerHTML = '';
    setInputMode('default');
  };

  // Save Chat Button Handler
  saveChatButton.onclick = () => {
    const title = prompt('Enter a title for this chat:', state.currentChat.title);
    if (title) {
      state.currentChat.title = title;
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
    savePromptButtonHandler();
  };

  
  // Send Button Handler
  sendButton.onclick = async () => {
    if (state.isProcessing) return;

    let message;
    if (state.currentInputMode === 'prompt' && state.selectedPrompt.variables.length > 0) {
        message = constructPromptMessage();
    } else {
        // This will handle both the default mode and prompt mode with no variables
        const promptText = state.selectedPrompt.content;
        const userInputText = userInput.value.trim();
        message = `${promptText}\n\n\`\`\`\n${userInputText}\n\`\`\``;
    }

    if (message) {
        setProcessingState(true);
        try {
            addMessage('user', message, chatMessages);
            state.currentChat.messages.push({ sender: 'user', text: message });
            clearInputs();

            const response = await sendMessageToOpenAI(message, state.selectedModel, state.apiKey);
            addMessage('bot', response, chatMessages);
            state.currentChat.messages.push({ sender: 'bot', text: response });
        } catch (error) {
            console.error('Error in send process:', error);
            addMessage('bot', 'Sorry, I encountered an error. Please try again.', chatMessages);
        } finally {
            setProcessingState(false);
        }
    }
};

  // Construct Prompt Message
  function constructPromptMessage() {
    let promptText = state.selectedPrompt.content;
    state.selectedPrompt.variables.forEach(variable => {
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
    state.isProcessing = processing;
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


  // Initialize the application
  updateChatList();
  updatePromptList();

  // Enter Keypress Handler
  userInput.onkeypress = (e) => {
    if (e.key === 'Enter' && !state.isProcessing) sendButton.onclick();
  };
});