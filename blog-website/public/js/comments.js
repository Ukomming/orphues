import { endpoints } from './api.js';
import { getCurrent } from './auth.js';

export async function renderComments(postId, container) {
  const tpl = document.getElementById('commentTemplate').content.cloneNode(true);
  const list = tpl.querySelector('.commentList');
  const form = tpl.querySelector('.commentForm');

  const comments = await endpoints.comments(postId);
  comments.forEach(c => {
    const li = document.createElement('li');
    li.innerHTML = `<strong>${c.user}</strong> <span class="text-gray-600 text-xs">${c.date}</span><br>${c.text}`;
    list.appendChild(li);
  });

  form.addEventListener('submit', async e => {
    e.preventDefault();
    const user = getCurrent();
    if (!user) return alert('Please log in to comment.');
    const text = form.querySelector('textarea').value.trim();
    if (!text) return;
    await endpoints.addComment(postId, { user: user.name, text });
    container.innerHTML = '';
    renderComments(postId, container);
  });
  container.appendChild(tpl);
}
