export function loadChatsFromLocalStorage() {
    return JSON.parse(localStorage.getItem('chats')) || [];
  }
  
  export function storeChatsInLocalStorage(chats) {
    localStorage.setItem('chats', JSON.stringify(chats));
  }
  
  export function loadPromptsFromLocalStorage() {
    return JSON.parse(localStorage.getItem('prompts')) || [];
  }
  
  export function storePromptsInLocalStorage(prompts) {
    localStorage.setItem('prompts', JSON.stringify(prompts));
  }
  
  export function getApiKeyFromLocalStorage() {
    return localStorage.getItem('openai_api_key');
  }
  
  export function storeApiKeyInLocalStorage(apiKey) {
    localStorage.setItem('openai_api_key', apiKey);
  }