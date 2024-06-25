import { fetchModelsFromOpenAI, sendMessageToOpenAI } from './llm_api.js';
import {
   storeChatsInLocalStorage,
  storeApiKeyInLocalStorage
} from './localStorage.js';

import { domElements } from './dom_elements.js';
import  state  from './state.js'; 
import { showAddPromptModal, savePromptButtonHandler } from './addNewPrompt.js';
import { updatePromptList, setInputMode } from './promptUI.js';
import { addMessage } from './chatRender.js';  // Import addMessage function
import { updateChatList } from './chatListManager.js';
import { initializeModelSelection, setupModelDropdownHandlers } from './modelParamsUI.js';
import { saveChatButtonHandler, newChatButtonHandler, clearInputs } from './chatUtils.js';


document.addEventListener('DOMContentLoaded', () => {

  const { chatList, chatMessages, userInput, sendButton, newChatButton, saveChatButton,
     currentChatTitle, apiKeyModal, apiKeyInput, 
     submitApiKeyButton, modelSelect, addPromptButton, addPromptModal, 
     promptNameInput, promptContentInput, savePromptButton, promptList, 
     promptContent, promptForm, dynamicInputArea, defaultInput, 
     promptInput, loadingIndicator } = domElements;


  // Setup Model Dropdown and Handlers
  if (state.apiKey) {
    initializeModelSelection(state.apiKey);
    setupModelDropdownHandlers((selectedModel) => {
      state.selectedModel = selectedModel;
    });
  }
  else 
  {
    showApiKeyModal();
  }
  submitApiKeyButton.onclick = () => {
    state.apiKey = apiKeyInput.value.trim();
    if (state.apiKey) {
      storeApiKeyInLocalStorage(state.apiKey);
      apiKeyModal.style.display = 'none';
      initializeModelSelection(state.apiKey);
    }
  };




  // New Chat Button Handler
  newChatButton.onclick = () => {
    newChatButtonHandler();
  };

  // Save Chat Button Handler
  saveChatButton.onclick = () => {
    saveChatButtonHandler();
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