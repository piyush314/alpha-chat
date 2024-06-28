// llm-api-manager.js

export const defaultLLMConfigs = [
    {
      name: 'OpenAI',
      endpoint: 'https://api.openai.com/v1/chat/completions',
      testPrompt: 'Say "Hello, World!"',
    },
    {
      name: 'Groq',
      endpoint: 'https://api.groq.com/openai/v1/chat/completions',
      testPrompt: 'Explain the importance of fast language models',
    },
  ];
  
  export function saveLLMConfig(config) {
    const llmConfigs = JSON.parse(localStorage.getItem('llmConfigs')) || {};
    llmConfigs[config.name] = config;
    localStorage.setItem('llmConfigs', JSON.stringify(llmConfigs));
    console.log('LLM config saved:', config);
  }
  
  export function getLLMConfigs() {
    const configs = JSON.parse(localStorage.getItem('llmConfigs')) || {};
    console.log('Retrieved LLM configs:', configs);
    return configs;
  }
  
  // We'll implement the test function in a later step
  export async function testLLMConfig(config) {
    console.log('Testing LLM config:', config);
    return true; // Placeholder
  }