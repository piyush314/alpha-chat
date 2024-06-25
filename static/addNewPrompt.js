import state from './state.js';
import { storePromptsInLocalStorage } from './localStorage.js';
import { updatePromptList, createPromptItem, selectPrompt, generatePromptForm } from './promptUI.js';
// Use these imported functions where necessary.


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

