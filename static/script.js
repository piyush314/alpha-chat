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
import { updateChatList } from './chatListManager.js';


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