// state.js
import { loadChatsFromLocalStorage, getApiKeyFromLocalStorage, loadPromptsFromLocalStorage } from './localStorage.js';

// Add this import at the top of the file
import { getLLMConfigs } from './llm-api-manager.js';

// ... (keep existing imports)

const state = {
  currentChat: { id: Date.now(), title: 'New Chat', messages: [] },
  chats: loadChatsFromLocalStorage() || [],
  apiKey: getApiKeyFromLocalStorage(),
  selectedModel: 'gpt-3.5-turbo',
  prompts: loadPromptsFromLocalStorage() || [],
  currentInputMode: 'default',
  defaultPrompt: { name: 'Default', content: '{{user-input}}', variables: ['user-input'] },
  selectedPrompt: { name: 'Default', content: '{{user-input}}', variables: ['user-input'] },
  isProcessing: false,
  llmConfigs: getLLMConfigs(),  // Load LLM configs from localStorage
  selectedLLM: 'OpenAI',  // Default to OpenAI, but we'll update this
};

// If there are no configurations loaded, add the default OpenAI config
if (Object.keys(state.llmConfigs).length === 0) {
  state.llmConfigs = {
    OpenAI: {
      name: 'OpenAI',
      endpoint: 'https://api.openai.com/v1/chat/completions',
      apiKey: getApiKeyFromLocalStorage(),
      defaultModel: 'gpt-3.5-turbo',
    }
  };
}

// Set the selectedLLM to the first available config if OpenAI is not present
if (!state.llmConfigs['OpenAI']) {
  state.selectedLLM = Object.keys(state.llmConfigs)[0] || 'OpenAI';
}

export default state;

// Log the state to console for verification
console.log('Initialized state:', state);