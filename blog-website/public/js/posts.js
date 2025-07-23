import { endpoints } from './api.js';
import { getCurrent } from './auth.js';
import { renderComments } from './comments.js';

let posts = [];

export async function loadPosts(filter = '') {
  posts = await endpoints.posts();
  const container = document.getElementById('postsContainer');
  container.innerHTML = '';

  const user = getCurrent();
  const isAdmin = user?.role === 'admin';

  for (const post of posts.filter(p => `${p.title} ${p.content}`.toLowerCase().includes(filter))) {
    const likeCount = (await endpoints.likes(post.id)).count;
    const liked = user && (await fetch(`/api/posts/${post.id}/likes`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ userId: user.id }) }).catch(() => {}));

    const div = document.createElement('div');
    div.className = 'post-card';
    div.dataset.id = post.id;
    div.innerHTML = `
      <img src="${post.image || 'https://via.placeholder.com/600x400'}" alt="${post.title}">
      <div class="post-content">
        <h3 class="text-xl font-bold">${post.title}</h3>
        <p class="text-gray-700">${post.content}</p>
        <p class="text-sm text-gray-500 mt-2">By ${post.author} · ${post.date}</p>

        <div class="flex items-center space-x-4 mt-3 text-sm">
          <button class="likeBtn flex items-center space-x-1">
            ❤️ <span>${likeCount}</span>
          </button>
          <button class="shareBtn">🔗 Share</button>
          ${isAdmin ? `
            <button class="editBtn text-blue-500">✏️ Edit</button>
            <button class="deleteBtn text-red-500">🗑️ Delete</button>
          ` : ''}
        </div>

        <div class="commentsArea" data-post-id="${post.id}"></div>
      </div>
    `;
    container.appendChild(div);

    // attach handlers
    if (user) {
      div.querySelector('.likeBtn').addEventListener('click', () => toggleLike(post.id, user.id));
      div.querySelector('.shareBtn').addEventListener('click', () => {
        const url = `${window.location.origin}/#post-${post.id}`;
        navigator.clipboard.writeText(url).then(() => alert('Link copied!'));
      });
    }
    if (isAdmin) {
      div.querySelector('.deleteBtn').addEventListener('click', () => deletePost(post.id));
      div.querySelector('.editBtn').addEventListener('click', () => openEditModal(post));
    }
    renderComments(post.id, div.querySelector('.commentsArea'));
  }
}

async function toggleLike(postId, userId) {
  // naive toggle: try DELETE if already liked
  await endpoints.unlike(postId, userId).catch(() => endpoints.like(postId, userId));
  loadPosts(document.getElementById('searchBox').value);
}

async function deletePost(id) {
  if (!confirm('Delete this post?')) return;
  await endpoints.deletePost(id);
  loadPosts();
}

function openEditModal(post) {
  document.getElementById('editPostId').value = post.id;
  document.getElementById('editTitle').value = post.title;
  document.getElementById('editContent').value = post.content;
  document.getElementById('editImage').value = post.image || '';
  document.getElementById('editPostModal').classList.remove('hidden');
}
