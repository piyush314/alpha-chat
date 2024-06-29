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
    // Add this line to update the LLM select dropdown when the page loads
  updateLLMSelect();

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

  // Add event listener for the close button
  const closeButton = document.querySelector('.close-button');
  closeButton.addEventListener('click', hideAddLLMConfigModal);

  // Add event listener for the edit prompt button
  const editPromptButton = document.getElementById('edit-prompt-button');
  editPromptButton.addEventListener('click', editSelectedPrompt);


  const editSelectedLLMButton = document.getElementById('edit-selected-llm');
  editSelectedLLMButton.addEventListener('click', showEditLLMConfigModal);

  const editLLMConfigModal = document.getElementById('edit-llm-config-modal');
  const closeEditModalButton = editLLMConfigModal.querySelector('.close-button');
  closeEditModalButton.addEventListener('click', hideEditLLMConfigModal);

  const updateLLMConfigButton = document.getElementById('update-llm-config');
  updateLLMConfigButton.addEventListener('click', updateLLMConfig);

  const deleteLLMConfigButton = document.getElementById('delete-llm-config');
  deleteLLMConfigButton.addEventListener('click', deleteLLMConfig);


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


  // Update the updateLLMSelect function
function updateLLMSelect() {
  const llmSelect = document.getElementById('llm-select');
  const configNames = Object.keys(state.llmConfigs);
  
  if (configNames.length > 0) {
    llmSelect.innerHTML = configNames
      .map(name => `<option value="${name}">${name}</option>`)
      .join('');
    llmSelect.value = state.selectedLLM;
  } else {
    llmSelect.innerHTML = '<option value="">No LLM configs available</option>';
    state.selectedLLM = '';
  }
}


// Add this function to handle editing the selected prompt
function editSelectedPrompt() {
  if (state.selectedPrompt) {
    // For now, just log the action. We'll implement the edit functionality later.
    console.log('Editing prompt:', state.selectedPrompt);
  }
}

function showEditLLMConfigModal() {
  const selectedLLM = state.selectedLLM;
  const config = state.llmConfigs[selectedLLM];
  if (!config) return;

  document.getElementById('edit-llm-name').value = config.name;
  document.getElementById('edit-llm-endpoint').value = config.endpoint;
  document.getElementById('edit-llm-api-key').value = config.apiKey;
  document.getElementById('edit-llm-default-model').value = config.defaultModel;

  const editLLMConfigModal = document.getElementById('edit-llm-config-modal');
  editLLMConfigModal.style.display = 'block';
}

function hideEditLLMConfigModal() {
  const editLLMConfigModal = document.getElementById('edit-llm-config-modal');
  editLLMConfigModal.style.display = 'none';
}

function updateLLMConfig() {
  const name = document.getElementById('edit-llm-name').value;
  const config = {
    name: name,
    endpoint: document.getElementById('edit-llm-endpoint').value,
    apiKey: document.getElementById('edit-llm-api-key').value,
    defaultModel: document.getElementById('edit-llm-default-model').value,
  };

  state.llmConfigs[name] = config;
  saveLLMConfig(config);
  updateLLMSelect();
  hideEditLLMConfigModal();
}

function deleteLLMConfig() {
  const name = document.getElementById('edit-llm-name').value;
  if (confirm(`Are you sure you want to delete the "${name}" configuration?`)) {
    delete state.llmConfigs[name];
    localStorage.setItem('llmConfigs', JSON.stringify(state.llmConfigs));
    updateLLMSelect();
    hideEditLLMConfigModal();

    // If the deleted config was the selected one, select the first available config
    if (state.selectedLLM === name) {
      const availableConfigs = Object.keys(state.llmConfigs);
      if (availableConfigs.length > 0) {
        state.selectedLLM = availableConfigs[0];
      } else {
        state.selectedLLM = '';
      }
    }
  }
}

