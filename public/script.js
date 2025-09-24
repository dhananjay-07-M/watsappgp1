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

  if (file) {
    const reader = new FileReader();
    reader.onload = () => {
      socket.emit('sendFile', {
        user: username,
        fileName: file.name,
        fileType: file.type,
        fileData: reader.result
      });
      fileInput.value = '';
    };
    reader.readAsDataURL(file);
  }

  if (message !== '') {
    socket.emit('sendMessage', { user: username, text: message });
    msgInput.value = '';
  }
}

function createMessageHTML({ user, text, type = 'message' }) {
  const isUser = user === username;

  if (type === 'system') {
    return `<div class="message system">${escapeHTML(text)}</div>`;
  }

  const isCode = text.includes('\n') || text.includes('  ') || text.includes('\t');

  const formattedText = isCode
    ? `<pre><code>${escapeHTML(text)}</code></pre>`
    : escapeHTML(text);

  return `
    <div class="message ${isUser ? 'user' : 'other'}">
      <strong>${escapeHTML(user)}:</strong> ${formattedText}
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
