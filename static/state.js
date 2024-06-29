// state.js
import { getLLMConfigs } from './llm-api-manager.js';
import { loadChatsFromLocalStorage, 
  getApiKeyFromLocalStorage,
  loadPromptsFromLocalStorage } from './localStorage.js';

// Add this import at the top of the file


// ... (keep existing imports)
const state = {
  currentChat: { id: Date.now(), title: 'New Chat', messages: [] },
  chats: loadChatsFromLocalStorage() || [],
  apiKey: getApiKeyFromLocalStorage(),
  selectedModel: null,  // We'll set this based on the selected LLM
  prompts: loadPromptsFromLocalStorage() || [],
  currentInputMode: 'default',
  defaultPrompt: { name: 'Default', content: '{{user-input}}', variables: ['user-input'] },
  selectedPrompt: { name: 'Default', content: '{{user-input}}', variables: ['user-input'] },
  isProcessing: false,
  llmConfigs: getLLMConfigs(),
  selectedLLM: null,  // We'll set this to the first available config
};

// If there are no configurations loaded, add a default OpenAI config
if (Object.keys(state.llmConfigs).length === 0) {
  state.llmConfigs = {
    OpenAI: {
      name: 'OpenAI',
      endpoint: 'https://api.openai.com/v1/chat/completions',
      apiKey: getApiKeyFromLocalStorage(),
      defaultModel: 'gpt-3.5-turbo',
      models: ['gpt-3.5-turbo', 'gpt-4', 'gpt-4o'],  // Add a default list of models
    }
  };
}


// Set the selectedLLM to the first available config
state.selectedLLM = Object.keys(state.llmConfigs)[0] || null;

// Set the selectedModel based on the selected LLM
if (state.selectedLLM) {
  state.selectedModel = state.llmConfigs[state.selectedLLM].defaultModel;
}

export default state;

// Log the state to console for verification
console.log('Initialized state:', state);