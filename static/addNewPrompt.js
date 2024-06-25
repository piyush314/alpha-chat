import state from './state.js';
import { storePromptsInLocalStorage } from './localStorage.js';

export function showAddPromptModal() {
    const addPromptModal = document.getElementById('add-prompt-modal');
    addPromptModal.style.display = 'block';
}

export function hideAddPromptModal() {
    const addPromptModal = document.getElementById('add-prompt-modal');
    addPromptModal.style.display = 'none';
}

export function clearAddPromptForm() {
    const promptNameInput = document.getElementById('prompt-name-input');
    const promptContentInput = document.getElementById('prompt-content-input');
    promptNameInput.value = '';
    promptContentInput.value = '';
}

export function savePromptButtonHandler() {
    const promptNameInput = document.getElementById('prompt-name-input');
    const promptContentInput = document.getElementById('prompt-content-input');
    const name = promptNameInput.value.trim();
    const content = promptContentInput.value.trim();
    if (name && content) {
        const newPrompt = { name, content, variables: parseVariables(content) };
        state.prompts.push(newPrompt);
        storePromptsInLocalStorage(state.prompts);
        updatePromptList();
        hideAddPromptModal();
        clearAddPromptForm();
    }
}

function parseVariables(content) {
    const regex = /{{(\w+)}}/g;
    const variables = new Set();
    let match;
    while ((match = regex.exec(content)) !== null) {
        variables.add(match[1]);
    }
    return Array.from(variables);
}

export function updatePromptList() {
    const promptList = document.getElementById('prompt-list');
    promptList.innerHTML = '';
    state.prompts.forEach(prompt => {
        const promptItem = createPromptItem(prompt);
        promptList.appendChild(promptItem);
    });
}

function createPromptItem(prompt) {
    console.log('prompt from create', prompt);
    const promptItem = document.createElement('div');
    promptItem.classList.add('prompt-item');
    promptItem.textContent = prompt.name;
    promptItem.onclick = () => selectPrompt(prompt);
    return promptItem;
}

export function selectPrompt(prompt) {
    console.log("Slecting prompt", prompt)
    const promptContent = document.getElementById('prompt-content');
    state.selectedPrompt = prompt;
    promptContent.textContent = prompt.content;
    generatePromptForm(prompt.variables);
}

function generatePromptForm(variables) {
    console.log("generating new form")
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
}
