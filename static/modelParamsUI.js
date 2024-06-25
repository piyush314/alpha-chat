import { fetchModelsFromOpenAI } from './llm_api.js';

export async function initializeModelSelection(apiKey) {
    const modelSelect = document.getElementById('model-select');
    try {
        const models = await fetchModelsFromOpenAI(apiKey);
        populateModelDropdown(models, modelSelect);
    } catch (error) {
        console.error('Error fetching models:', error);
    }
}

function populateModelDropdown(models, modelSelect) {
    modelSelect.innerHTML = '<option value="">Select a model</option>';
    models.forEach(model => {
        const option = document.createElement('option');
        option.value = model.id;
        option.textContent = model.id;
        modelSelect.appendChild(option);
    });
}

export function setupModelDropdownHandlers(onModelChange) {
    const modelSelect = document.getElementById('model-select');
    modelSelect.onchange = (e) => {
        onModelChange(e.target.value);
    };
}
