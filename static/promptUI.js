import state from './state.js';
// import { setInputMode } from './addPrompt.js';  // Assuming setInputMode might still be relevant for prompt-related UI actions

export function updatePromptList() {
    const promptList = document.getElementById('prompt-list');
    promptList.innerHTML = '';
    state.prompts.forEach(prompt => {
        const promptItem = createPromptItem(prompt);
        promptList.appendChild(promptItem);
    });
}



export function createPromptItem(prompt) {
    const promptItem = document.createElement('div');
    promptItem.classList.add('prompt-item');
    promptItem.textContent = prompt.name;
    promptItem.dataset.name = prompt.name; // Add this line to set the data-name attribute
    promptItem.onclick = () => selectPrompt(prompt);
    return promptItem;
  }

export function selectPrompt(prompt) {
    const promptContent = document.getElementById('prompt-content');
    state.selectedPrompt = prompt;
    promptContent.textContent = prompt.content;
    
    // Remove 'selected' class from all prompt items
    document.querySelectorAll('.prompt-item').forEach(item => item.classList.remove('selected'));
    
    // Add 'selected' class to the clicked prompt item
    const selectedItem = document.querySelector(`.prompt-item[data-name="${prompt.name}"]`);
    if (selectedItem) {
      selectedItem.classList.add('selected');
    }
    
    generatePromptForm(prompt.variables);
  }
  

export function generatePromptForm(variables) {
    const promptForm = document.getElementById('prompt-form');
    promptForm.innerHTML = '';
    variables.forEach((variable, index) => {
        const input = document.createElement('input');
        input.type = 'text';
        input.id = `var-${variable}`;
        input.placeholder = variable;
        input.className = 'prompt-input-field';
        if (index === 0) input.autofocus = true;
        promptForm.appendChild(input);
    });
    setInputMode(variables.length > 0 ? 'prompt' : 'default');
}


  // Set Input Mode
  export function setInputMode(mode) {
    state.currentInputMode = mode;
    const defaultInput = document.getElementById('default-input');
    const promptInput = document.getElementById('prompt-input');
    defaultInput.classList.toggle('active', mode === 'default');
    promptInput.classList.toggle('active', mode === 'prompt');
  }
