// chatListManager.js

import state from './state.js';
// import { loadChat } from './currentChatManager.js'; // Assume this will be refactored next
import { addMessage } from './chatRender.js';

export function updateChatList() {
    const chatList = document.getElementById('chat-list');
    chatList.innerHTML = '';
    state.chats.forEach(chat => {
        const chatItem = createChatItem(chat);
        chatList.appendChild(chatItem);
    });
}

function createChatItem(chat) {
    const chatItem = document.createElement('div');
    chatItem.classList.add('chat-item');
    chatItem.textContent = chat.title;
    chatItem.onclick = () => loadChat(chat);
    return chatItem;
}


  // Chat Loading
  function loadChat(chat) {
    state.currentChat = chat;
    const currentChatTitle = document.getElementById('current-chat-title');
    // document.getElementById('current-chat-title')
    const chatMessages = document.getElementById('chat-messages');
    currentChatTitle.textContent = chat.title;
    chatMessages.innerHTML = '';
    chat.messages.forEach(message => addMessage(message.sender, message.text, chatMessages));
  }
