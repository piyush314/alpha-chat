import { storeChatsInLocalStorage } from './localStorage.js';
import state from './state.js';
import { updateChatList } from './chatListManager.js';
import { setInputMode } from './promptUI.js';

  // Chat Saving
  export function saveCurrentChat() {
    const existingIndex = state.chats.findIndex(chat => chat.id === state.currentChat.id);
    if (existingIndex !== -1) {
      state.chats[existingIndex] = state.currentChat;
    } else {
      state.chats.push(state.currentChat);
    }
    storeChatsInLocalStorage(state.chats);
    updateChatList();
  }

  export function saveChatButtonHandler() {
    const title = prompt('Enter a title for this chat:', state.currentChat.title);
    if (title) {
      state.currentChat.title = title;
      const currentChatTitle = document.getElementById('current-chat-title');
      currentChatTitle.textContent = title;
      saveCurrentChat();
    }
  }


  export function newChatButtonHandler() {
    

    state.currentChat = { id: Date.now(), title: 'New Chat', messages: [] };
    const currentChatTitle = document.getElementById('current-chat-title');
    currentChatTitle.textContent = 'New Chat';
    const chatMessages = document.getElementById('chat-messages');
    chatMessages.innerHTML = '';
    setInputMode('default');
    // saveCurrentChat();
  }

  export   function clearInputs() {
    const userInput = document.getElementById('user-input');
    const promptForm = document.getElementById('prompt-form');
    userInput.value = '';
    promptForm.reset();
  }
