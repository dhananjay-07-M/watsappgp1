const socket = io();

let username = '';

function joinChat() {
  username = document.getElementById('username').value.trim();
  if (!username) return alert('Please enter your name.');

  document.getElementById('login').classList.add('hidden');
  document.getElementById('chat').classList.remove('hidden');

  document.getElementById('userWelcome').textContent = `Logged in as: ${username}`;
  socket.emit('join', username);
}

function sendMessage() {
  const msgInput = document.getElementById('messageInput');
  const fileInput = document.getElementById('fileUpload');
  const message = msgInput.value.trim();
  const file = fileInput.files[0];

  // Send file if exists
  if (file) {
    const reader = new FileReader();
    reader.onload = () => {
      socket.emit('sendFile', {
        fileName: file.name,
        fileType: file.type,
        fileData: reader.result
      });
      fileInput.value = '';
    };
    reader.readAsDataURL(file);
  }

  // Send text message if exists
  if (message !== '') {
    socket.emit('sendMessage', message);
    msgInput.value = '';
  }
}

function createMessageHTML({ user, text, type = 'message' }) {
  const isUser = user === username;
  if (type === 'system') {
    return `<div class="message system">${escapeHTML(text)}</div>`;
  }
  return `
    <div class="message ${isUser ? 'user' : 'other'}">
      <strong>${escapeHTML(user)}:</strong> ${escapeHTML(text)}
    </div>
  `;
}

function createFileMessageHTML({ user, fileName, fileType, fileData }) {
  const isUser = user === username;
  let fileElement = '';

  if (fileType.startsWith('image/')) {
    fileElement = `<img src="${fileData}" alt="${escapeHTML(fileName)}" style="max-width:200px; border-radius:8px;">`;
  } else {
    fileElement = `<a href="${fileData}" download="${escapeHTML(fileName)}" style="color:#007bff; text-decoration:none;">Download ${escapeHTML(fileName)}</a>`;
  }

  return `
    <div class="message ${isUser ? 'user' : 'other'}">
      <strong>${escapeHTML(user)}:</strong><br/>
      ${fileElement}
    </div>
  `;
}

function escapeHTML(str) {
  return str.replace(/[&<>"']/g, m => ({
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#39;'
  })[m]);
}

// Listeners
socket.on('message', data => {
  const messagesEl = document.getElementById('messages');
  messagesEl.insertAdjacentHTML('beforeend', createMessageHTML(data));
  messagesEl.lastElementChild.scrollIntoView();
});

socket.on('file', data => {
  const messagesEl = document.getElementById('messages');
  messagesEl.insertAdjacentHTML('beforeend', createFileMessageHTML(data));
  messagesEl.lastElementChild.scrollIntoView();
});

socket.on('system', text => {
  const messagesEl = document.getElementById('messages');
  messagesEl.insertAdjacentHTML('beforeend', createMessageHTML({ text, type: 'system' }));
  messagesEl.lastElementChild.scrollIntoView();
});

// Send message on Enter key press
document.getElementById('messageInput').addEventListener('keydown', e => {
  if (e.key === 'Enter') sendMessage();
});
