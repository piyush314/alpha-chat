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
  
 // Replace the placeholder testLLMConfig function with this implementation
export async function testLLMConfig(config) {
    try {
      const response = await axios.post(
        config.endpoint,
        {
          messages: [{ role: 'user', content: config.testPrompt || 'Test' }],
          model: config.defaultModel || 'gpt-3.5-turbo', // You may want to make this configurable
        },
        {
          headers: {
            'Authorization': `Bearer ${config.apiKey}`,
            'Content-Type': 'application/json',
          },
        }
      );
      return response.data.choices[0].message.content.trim() !== '';
    } catch (error) {
      console.error('Error testing LLM config:', error);
      return false;
    }
  }

  // Add this new function to send messages using the selected LLM config
export async function sendMessageToLLM(message, model, config) {
    try {
      const response = await axios.post(
        config.endpoint,
        {
          messages: [{ role: 'user', content: message }],
          model: model,
        },
        {
          headers: {
            'Authorization': `Bearer ${config.apiKey}`,
            'Content-Type': 'application/json',
          },
        }
      );
      return response.data.choices[0].message.content;
    } catch (error) {
      console.error('Error sending message to LLM:', error);
      throw error;
    }
  }