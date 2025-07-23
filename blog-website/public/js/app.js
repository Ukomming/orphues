import { loadPosts } from './posts.js';
import { login, logout, signup, getCurrent } from './auth.js';

document.addEventListener('DOMContentLoaded', async () => {
  await loadPosts();

  // Search
  document.getElementById('searchBox').addEventListener('input', e => loadPosts(e.target.value.toLowerCase()));

  // UI toggles
  function toggleAuthUI() {
    const user = getCurrent();
    const isAdmin = user?.role === 'admin';

    ['loginBtn', 'signupBtn'].forEach(id => {
      const el = document.getElementById(id);
      if (el) el.classList.toggle('hidden', !!user);
    });
    ['logoutBtn', 'newPostBtn'].forEach(id => {
      const el = document.getElementById(id);
      if (el) el.classList.toggle('hidden', !user);
    });
    if (document.getElementById('logoutBtn') && user) {
      document.getElementById('logoutBtn').textContent = `Logout (${user.name})`;
    }
  }

  // create Sign-Up button if not exists
  const nav = document.querySelector('nav .space-x-4');
  if (!document.getElementById('signupBtn')) {
    const btn = document.createElement('button');
    btn.id = 'signupBtn';
    btn.textContent = 'Sign Up';
    btn.className = 'text-gray-600 hover:text-gray-800';
    btn.onclick = () => document.getElementById('signupModal').classList.remove('hidden');
    nav.insertBefore(btn, document.getElementById('loginBtn'));
  }

  // forms
  document.getElementById('loginForm').addEventListener('submit', async e => {
    e.preventDefault();
    try {
      await login(document.getElementById('loginEmail').value.trim(), document.getElementById('loginPassword').value);
      document.getElementById('loginModal').classList.add('hidden');
      toggleAuthUI();
      await loadPosts();
    } catch (err) { alert(err); }
  });

  document.getElementById('signupForm').addEventListener('submit', async e => {
    e.preventDefault();
    try {
      await signup(document.getElementById('signupName').value.trim(), document.getElementById('signupEmail').value.trim(), document.getElementById('signupPass').value);
      document.getElementById('signupModal').classList.add('hidden');
      alert('Account created! Please log in.');
    } catch (err) { alert(err); }
  });

  document.getElementById('logoutBtn').addEventListener('click', () => {
    logout();
    toggleAuthUI();
    loadPosts();
  });

  document.getElementById('newPostForm').addEventListener('submit', async e => {
    e.preventDefault();
    const user = getCurrent();
    if (!user) return alert('You must be logged in to post.');
    await fetch('http://localhost:3000/api/posts', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        title: document.getElementById('postTitle').value,
        content: document.getElementById('postContent').value,
        image: document.getElementById('postImage').value,
        author: user.name
      })
    });
    document.getElementById('newPostModal').classList.add('hidden');
    await loadPosts();
  });

  document.getElementById('editPostForm').addEventListener('submit', async e => {
    e.preventDefault();
    const id = document.getElementById('editPostId').value;
    await endpoints.updatePost(id, {
      title: document.getElementById('editTitle').value,
      content: document.getElementById('editContent').value,
      image: document.getElementById('editImage').value
    });
    document.getElementById('editPostModal').classList.add('hidden');
    await loadPosts();
  });

  toggleAuthUI();
});
