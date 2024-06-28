// state.js
import { loadChatsFromLocalStorage, getApiKeyFromLocalStorage, loadPromptsFromLocalStorage } from './localStorage.js';

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
  llmConfigs: {
    OpenAI: {
      name: 'OpenAI',
      endpoint: 'https://api.openai.com/v1/chat/completions',
      apiKey: getApiKeyFromLocalStorage(),
      defaultModel: 'gpt-3.5-turbo',
    }
  },
  selectedLLM: 'OpenAI',
};

export default state;

// Log the state to console for verification
console.log('Updated state:', state);