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
// import { saveLLMConfig, getLLMConfigs, testLLMConfig } from './llm-api-manager.js';

// import { defaultLLMConfigs, saveLLMConfig, testLLMConfig } from './llm-api-manager.js';
import { defaultLLMConfigs, saveLLMConfig, testLLMConfig, sendMessageToLLM } from './llm-api-manager.js';


// Add this function to handle the modal
function showAddLLMConfigModal() {
  const modal = document.getElementById('add-llm-config-modal');
  modal.style.display = 'block';
}

// Add this function to hide the modal
function hideAddLLMConfigModal() {
  const modal = document.getElementById('add-llm-config-modal');
  modal.style.display = 'none';
}

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

  
  sendButton.onclick = async () => {
    if (state.isProcessing) return;

    let message;
    if (state.currentInputMode === 'prompt' && state.selectedPrompt.variables.length > 0) {
      message = constructPromptMessage();
    } else {
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

        const config = state.llmConfigs[state.selectedLLM];
        const response = await sendMessageToLLM(message, state.selectedModel, config);
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


const llmSelect = document.getElementById('llm-select');
  llmSelect.addEventListener('change', handleLLMChange);

  const addLLMConfigButton = document.getElementById('add-llm-config');
  addLLMConfigButton.addEventListener('click', showAddLLMConfigModal);

  const llmPreset = document.getElementById('llm-preset');
  const llmName = document.getElementById('llm-name');
  const llmEndpoint = document.getElementById('llm-endpoint');
  const llmApiKey = document.getElementById('llm-api-key');
  const llmDefaultModel = document.getElementById('llm-default-model');
  const testButton = document.getElementById('test-llm-config');
  const saveButton = document.getElementById('save-llm-config');

  llmPreset.addEventListener('change', () => {
    const selectedConfig = defaultLLMConfigs.find(config => config.name === llmPreset.value);
    if (selectedConfig) {
      llmName.value = selectedConfig.name;
      llmEndpoint.value = selectedConfig.endpoint;
      llmDefaultModel.value = '';
    } else {
      llmName.value = '';
      llmEndpoint.value = '';
      llmDefaultModel.value = '';
    }
  });

  testButton.addEventListener('click', async () => {
    const config = {
      name: llmName.value,
      endpoint: llmEndpoint.value,
      apiKey: llmApiKey.value,
      defaultModel: llmDefaultModel.value,
    };
    const isWorking = await testLLMConfig(config);
    alert(isWorking ? 'Configuration is working!' : 'Configuration test failed.');
  });

  saveButton.addEventListener('click', () => {
    const config = {
      name: llmName.value,
      endpoint: llmEndpoint.value,
      apiKey: llmApiKey.value,
      defaultModel: llmDefaultModel.value,
    };
    saveLLMConfig(config);
    state.llmConfigs[config.name] = config;
    updateLLMSelect();
    hideAddLLMConfigModal();
  });

});


  // Add this function to the bottom of the file
  function handleLLMChange(event) {
  state.selectedLLM = event.target.value;
  const config = state.llmConfigs[state.selectedLLM];
  if (config) {
    state.apiKey = config.apiKey;
    state.selectedModel = config.defaultModel;
    // You may want to update the model selection dropdown here as well
    console.log('Selected LLM changed:', state.selectedLLM);
  }
}


  window.testLLMManager = {
    saveConfig: function(config) {
      saveLLMConfig(config);
      console.log('Config saved. Current configs:', getLLMConfigs());
    },
    
    getConfigs: function() {
      return getLLMConfigs();
    },
    
    testConfig: async function(config) {
      const result = await testLLMConfig(config);
      console.log('Test result:', result);
      return result;
    }
  };

  function updateLLMSelect() {
    const llmSelect = document.getElementById('llm-select');
    llmSelect.innerHTML = Object.keys(state.llmConfigs)
      .map(name => `<option value="${name}">${name}</option>`)
      .join('');
    llmSelect.value = state.selectedLLM;
  }
  