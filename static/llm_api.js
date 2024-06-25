// llm_api.js
export async function fetchModelsFromOpenAI(apiKey) {
    const response = await axios.get('https://api.openai.com/v1/models', {
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json'
      }
    });
    return response.data.data.filter(model => model.id.startsWith('gpt-'));
  }
  
  export async function sendMessageToOpenAI(message, selectedModel, apiKey) {
    try {
      const response = await axios.post('https://api.openai.com/v1/chat/completions', {
        model: selectedModel,
        messages: [{"role": "user", "content": message}],
        temperature: 0.7
      }, {
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json'
        }
      });
      return response.data.choices[0].message.content;
    } catch (error) {
      console.error('Error:', error);
      throw error;
    }
  }
  