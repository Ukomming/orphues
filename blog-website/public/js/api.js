const API = 'http://localhost:3000/api';

export const endpoints = {
  register: (body) => fetch(`${API}/register`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) }).then(r => r.json()),
  login:    (body) => fetch(`${API}/login`,    { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) }).then(r => r.json()),
  posts:    ()     => fetch(`${API}/posts`).then(r => r.json()),
  addPost:  (body) => fetch(`${API}/posts`,    { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) }).then(r => r.json()),
  updatePost: (id,body)=> fetch(`${API}/posts/${id}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) }).then(r => r.json()),
  deletePost: (id) => fetch(`${API}/posts/${id}`, { method: 'DELETE' }).then(r => r.json()),
  comments: (id) => fetch(`${API}/posts/${id}/comments`).then(r => r.json()),
  addComment: (id,body)=> fetch(`${API}/posts/${id}/comments`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) }).then(r => r.json()),
  likes:    (id) => fetch(`${API}/posts/${id}/likes`).then(r => r.json()),
  like:     (id,uid)=> fetch(`${API}/posts/${id}/like`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ userId: uid }) }).then(r => r.json()),
  unlike:   (id,uid)=> fetch(`${API}/posts/${id}/like`, { method: 'DELETE', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ userId: uid }) }).then(r => r.json())
};
