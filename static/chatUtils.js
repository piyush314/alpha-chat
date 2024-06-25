import { storeChatsInLocalStorage } from './localStorage.js';
import state from './state.js';
import { updateChatList } from './chatListManager.js';

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
