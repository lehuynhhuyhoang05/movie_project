// Gọi API lấy chi tiết phim theo ID
async function getMovieDetail(id) {
  try {
    const response = await fetch(`http://localhost/movie_project/src/backend/server.php?controller=movie&method=detail&id=${id}`);
    if (!response.ok) throw new Error('Lỗi HTTP: ' + response.status);
    return await response.json();
  } catch (error) {
    console.error('Lỗi khi lấy chi tiết phim:', error);
    return { status: 'error', data: null };
  }
}

function getEmbedUrl(url) {
  if (!url) return null;
  const youtubeMatch = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&?/]+)/);
  return youtubeMatch && youtubeMatch[1] ? `https://www.youtube.com/embed/${youtubeMatch[1]}` : url;
}

function getRandomDefaultTrailer() {
  const defaultTrailers = [
    'https://www.youtube.com/embed/yQCpGW7bZyo',
    'https://www.youtube.com/embed/xY-qRGC6Yu0',
    'https://www.youtube.com/embed/6txjTWLoSc8'
  ];
  const randomIndex = Math.floor(Math.random() * defaultTrailers.length);
  return defaultTrailers[randomIndex];
}

function renderMovieDetail(movie) {
  const container = document.getElementById('movie-details');
  if (!container) return;

  const trailerEmbedUrl = getEmbedUrl(movie.trailer_url) || getRandomDefaultTrailer();
  const genreNameMapVi = {
    Action: 'Hành động', Adventure: 'Phiêu lưu', Animation: 'Hoạt hình',
    Comedy: 'Hài', Crime: 'Tội phạm', Documentary: 'Tài liệu', History: 'Lịch sử',
    Family: 'Gia đình', Fantasy: 'Giả tưởng', Drama: 'Chính kịch', Horror: 'Kinh dị',
    Music: 'Âm nhạc', Mystery: 'Bí ẩn', Romance: 'Lãng mạn',
    'Science Fiction': 'Khoa học viễn tưởng', Thriller: 'Gây cấn', War: 'Chiến tranh',
    Western: 'Cao bồi viễn tây', 'TV Movie': 'Phim truyền hình'
  };
  const user = JSON.parse(localStorage.getItem('user'));
  const isLoggedIn = !!localStorage.getItem('token');
  const duration = movie.duration ? `${movie.duration} phút` : 'Chưa rõ';
  const director = movie.director || 'Chưa rõ';

  container.innerHTML = `
    <button onclick="history.back()" class="back-btn">← Quay lại</button>
    <div style="display: flex; gap: 20px; flex-wrap: wrap;">
      <div style="width: 100%; margin-bottom: 20px;">
        <iframe width="100%" height="400" src="${trailerEmbedUrl}" frameborder="0" allowfullscreen></iframe>
      </div>
      <div style="max-width: 200px;">
        <img src="${movie.poster_url || movie.poster || '../assets/images/default-poster.jpg'}" alt="${movie.title}" style="width: 100%;" />
      </div>
      <div style="flex: 1; min-width: 300px;">
        <div style="display: flex; align-items: center; gap: 15px; margin-bottom: 10px;">
          <h1 style="margin: 0; font-size: 2rem;">${movie.title || 'Không có tiêu đề'}</h1>
          ${isLoggedIn ? `
            <button id="favoriteBtn" onclick="toggleFavorite(${movie.id})"
              style="display: flex; align-items: center; gap: 6px;">
              <i class="fas fa-heart"></i>
              <span>Yêu thích</span>
            </button>
            <button id="watchlistBtn" onclick="addToWatchlist(${movie.id})"
              style="display: flex; align-items: center; gap: 6px;">
              <i class="fas fa-list"></i>
              <span>Thêm vào xem sau</span>
            </button>
          ` : ''}
        </div>
        <p><strong>Thể loại:</strong> ${genreNameMapVi[movie.genre_name] || movie.genre_name || 'Không rõ'}</p>
        <p class="rating"><strong>IMDb: </strong>${movie.imdb_rating || 'N/A'}</p>
        <p><strong>Ngày phát hành:</strong> ${movie.release_date || 'Không rõ'}</p>
        <p><strong>Thời lượng:</strong> ${duration}</p>
        <p><strong>Đạo diễn:</strong> ${director}</p>
        <p><strong>Mô tả:</strong> ${movie.description || 'Không có mô tả'}</p>
        <h3>Diễn viên:</h3>
        <div style="display: flex; flex-wrap: wrap; gap: 15px;">
          ${movie.actors?.length ? movie.actors.map(actor => `
            <div style="width: 120px; text-align: center;">
              <img src="${actor.profile_url}" alt="${actor.name}" style="width: 100%; border-radius: 8px;" />
              <p><strong>${actor.name}</strong></p>
              <p style="font-size: 0.9em; color: #999;">${actor.role}</p>
            </div>
          `).join('') : '<p>Không có diễn viên.</p>'}
        </div>
        <h3 style="margin-top: 25px;">Bình luận:</h3>
        ${isLoggedIn ? `
          <div style="margin-top: 10px;">
            <textarea id="comment-text" rows="4" placeholder="Nhập bình luận..." style="width: 90%; padding: 5px; border-radius: 6px; border: 1px solid #ccc;"></textarea>
            <button onclick="submitComment()" style="margin-top: 10px; background-color: #e50914; color: white; padding: 8px 10px; border: none; border-radius: 6px; cursor: pointer; margin-bottom: 15px">Gửi bình luận</button>
          </div>
        ` : `<p>Bạn cần <a href="/src/frontend/pages/login.html" style="color: #e50914;">đăng nhập</a> để bình luận.</p>`}
        <div id="comment-list"></div>
      </div>
    </div>
  `;
}

window.onload = async function () {
   // BẮT ĐẦU SỬA
  const movieDetailsContainer = document.getElementById('movie-details');
  if (!movieDetailsContainer) {
    return;
  }
  // KẾT THÚC SỬA
  const params = new URLSearchParams(window.location.search);
  const id = params.get('id');

  if (!id) {
    document.getElementById('movie-details').innerHTML = '<p>Không có ID phim trong URL.</p>';
    return;
  }

  const result = await getMovieDetail(id);
  if (result.status === 'success' && result.data) {
    renderMovieDetail(result.data);
    loadComments(result.data.id);
    checkFavoriteStatus(result.data.id); // Kiểm tra trạng thái yêu thích
    checkWatchlistStatus(result.data.id); // Kiểm tra trạng thái watchlist
  } else {
    document.getElementById('movie-details').innerHTML = '<p>Không tìm thấy thông tin phim.</p>';
  }
};

function loadComments(movieId) {
  fetch(`http://localhost/movie_project/src/backend/server.php?controller=review&method=getComments&id=${movieId}`)
    .then(response => {
      if (!response.ok) throw new Error(`Lỗi HTTP! trạng thái: ${response.status}`);
      return response.json();
    })
    .then(result => {
      const commentList = document.getElementById('comment-list');

      if (result.status === 'error') {
        commentList.innerHTML = `<p>${result.message || 'Không thể tải bình luận.'}</p>`;
        return;
      }
      if (!Array.isArray(result.data) || result.data.length === 0) {
        commentList.innerHTML = '<p>Chưa có bình luận.</p>';
        return;
      }

      const user = JSON.parse(localStorage.getItem('user'));

      const renderCommentTree = (comments, isFirst = false) => {
        return comments.map((comment, index) => {
          // Xác định bình luận đầu tiên (chỉ áp dụng cho bình luận gốc, không phải trả lời)
          const isFirstComment = isFirst && index === 0 && !comment.parent_id;
          // Thêm badge cho bình luận đầu tiên
          const firstCommentBadge = isFirstComment ? '<span style="color:rgb(195, 32, 32); font-size: 0.7em; margin-left: 8px; vertical-align: middle;" title="Bình luận đầu tiên">★</span>' : '';

          const childrenHtml = (comment.children && comment.children.length > 0)
            ? `<ul style="padding-left: 25px; border-left: 2px solid #333; margin-top: 10px;">
                 ${renderCommentTree(comment.children)}
               </ul>`
            : '';

          return `
            <li class="comment-item" style="list-style-type: none; margin-top: 15px;">
              <p><strong>${comment.username}:</strong> ${comment.content || ''}${firstCommentBadge}</p>
              <div>
                ${user && user.username === comment.username ? `
                  <button class="btn-delete" data-id="${comment.id}" style="margin-top: 5px; background-color: #e50914; color: white; padding: 4px 8px; border: none; border-radius: 6px; cursor: pointer; margin-right: 5px;">Xoá</button>
                  <button class="btn-edit" data-id="${comment.id}" data-comment="${comment.content ? comment.content.replace(/"/g, '&quot;') : ''}" style="margin-top: 5px; background-color: #e50914; color: white; padding: 4px 8px; border: none; border-radius: 6px; cursor: pointer; margin-right: 5px;">Sửa</button>
                ` : ''}
                ${user ? `
                  <button class="btn-reply" data-id="${comment.id}" style="margin-top: 5px; background-color: #e50914; color: white; padding: 4px 8px; border: none; border-radius: 6px; cursor: pointer;">Trả lời</button>
                ` : ''}
              </div>
              ${childrenHtml}
            </li>
          `;
        }).join('');
      };

      commentList.innerHTML = `<ul style="padding-left: 0;">${renderCommentTree(result.data, true)}</ul>`;

      commentList.querySelectorAll('.btn-delete').forEach(btn => {
        btn.onclick = () => deleteComment(btn.dataset.id);
      });
      commentList.querySelectorAll('.btn-edit').forEach(btn => {
        btn.onclick = () => editComment(btn.dataset.id, btn.dataset.comment);
      });
      commentList.querySelectorAll('.btn-reply').forEach(btn => {
        btn.onclick = () => showReplyForm(btn.dataset.id);
      });
    })
    .catch(err => {
      console.error('Lỗi khi tải bình luận:', err);
      document.getElementById('comment-list').innerHTML = '<p>Không thể tải bình luận.</p>';
    });
}
function submitComment() {
  const commentText = document.getElementById('comment-text').value.trim();
  const movieId = new URLSearchParams(window.location.search).get('id');
  if (!commentText) return alert('Vui lòng nhập bình luận!');
  if (!movieId) return alert('Không tìm thấy ID phim!');
  createComment(movieId, commentText, null); // null parent_id cho bình luận gốc
  document.getElementById('comment-text').value = '';
}

function showReplyForm(commentId) {
  const commentItem = document.querySelector(`.comment-item [data-id="${commentId}"]`).closest('.comment-item');
  if (!commentItem) return;

  let replyForm = commentItem.querySelector('.reply-form');
  if (replyForm) {
    replyForm.remove();
    return;
  }

  replyForm = document.createElement('div');
  replyForm.className = 'reply-form';
  replyForm.innerHTML = `
    <textarea class="reply-text" rows="2" placeholder="Nhập trả lời..." style="width: 90%; padding: 5px; border-radius: 6px; border: 1px solid #ccc; margin-top: 5px;"></textarea>
    <button onclick="submitReply(${commentId})" style="margin-top: 5px; background-color: #e50914; color: white; padding: 4px 8px; border: none; border-radius: 6px; cursor: pointer;">Gửi trả lời</button>
    <button onclick="this.parentElement.remove()" style="margin-top: 5px; background-color: #ccc; color: black; padding: 4px 8px; border: none; border-radius: 6px; cursor: pointer;">Hủy</button>
  `;
  commentItem.appendChild(replyForm);
}

function submitReply(parentId) {
  const replyText = document.querySelector(`.comment-item [data-id="${parentId}"]`).closest('.comment-item').querySelector('.reply-text').value.trim();
  const movieId = new URLSearchParams(window.location.search).get('id');
  if (!replyText) return alert('Vui lòng nhập trả lời!');
  if (!movieId) return alert('Không tìm thấy ID phim!');
  createComment(movieId, replyText, parentId);
  document.querySelector(`.comment-item [data-id="${parentId}"]`).closest('.comment-item').querySelector('.reply-form').remove();
}

function createComment(movieId, content, parentId = null) {
  const token = localStorage.getItem('token');
  if (!token) return alert('Bạn cần đăng nhập để gửi bình luận.');

  fetch(`http://localhost/movie_project/src/backend/server.php?controller=review&method=createComment&token=Bearer%20${encodeURIComponent(token)}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ movie_id: movieId, content, parent_id: parentId })
  })
  .then(res => res.json())
  .then(data => {
    if (data.status === 'success') loadComments(movieId);
    else alert('Gửi bình luận thất bại: ' + (data.message || 'Lỗi server'));
  })
  .catch(err => {
    console.error('Lỗi khi gửi bình luận:', err);
    alert('Lỗi kết nối server.');
  });
}

function deleteComment(commentId) {
  const token = localStorage.getItem('token');
  const movieId = new URLSearchParams(window.location.search).get('id');
  if (!token || !commentId) return alert('Không đủ quyền hoặc thiếu ID.');
  fetch(`http://localhost/movie_project/src/backend/server.php?controller=review&method=deleteComment&id=${commentId}&token=Bearer%20${encodeURIComponent(token)}`, {
    method: 'DELETE'
  })
  .then(res => res.json())
  .then(data => {
    if (data.status === 'success') {
      alert('Đã xoá thành công');
      loadComments(movieId);
    } else {
      alert('Xoá thất bại: ' + (data.message || 'Lỗi server'));
    }
  })
  .catch(err => {
    console.error(err);
    alert('Lỗi kết nối server.');
  });
}

function editComment(commentId, oldComment) {
  const newComment = prompt('Chỉnh sửa bình luận:', oldComment);
  if (newComment === null || newComment.trim() === '') return;
  const movieId = new URLSearchParams(window.location.search).get('id');
  updateComment(commentId, newComment.trim(), movieId);
}

function updateComment(commentId, content, movieId) {
  const token = localStorage.getItem('token');
  if (!token || !commentId) return alert('Thiếu token hoặc comment ID');
  fetch(`http://localhost/movie_project/src/backend/server.php?controller=review&method=updateComment&id=${commentId}&token=Bearer%20${encodeURIComponent(token)}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ content })
  })
  .then(res => res.json())
  .then(data => {
    if (data.status === 'success') {
      alert('Cập nhật thành công');
      loadComments(movieId);
    } else {
      alert('Cập nhật thất bại: ' + (data.message || 'Lỗi server'));
    }
  })
  .catch(() => alert('Lỗi kết nối server.'));
}

// Danh sách yêu thích
async function toggleFavorite(movie_id) {
  const token = localStorage.getItem('token');
  if (!token) {
    alert('Vui lòng đăng nhập để thêm vào yêu thích!');
    return;
  }

  try {
    const response = await fetch(`http://localhost/movie_project/src/backend/server.php?controller=movie&method=addFavorite&movie_id=${movie_id}&token=Bearer%20${encodeURIComponent(token)}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`
      }
    });

    const data = await response.json();

    if (data.status === 'success') {
      alert('Đã thêm vào danh sách yêu thích!');
      const favoriteBtn = document.getElementById('favoriteBtn');
      if (favoriteBtn) {
        favoriteBtn.querySelector('i').style.color = 'red';
        favoriteBtn.querySelector('span').innerText = 'Đã yêu thích';
      }
    } else {
      alert('Lỗi: ' + data.message);
    }
  } catch (error) {
    console.error('Lỗi thêm vào yêu thích:', error);
    alert('Đã xảy ra lỗi, vui lòng thử lại sau.');
  }
}

async function checkFavoriteStatus(movieId) {
  const token = localStorage.getItem('token');
  if (!token) return;

  try {
    const response = await fetch(`${API_BASE}?controller=movie&method=getFavorites&token=Bearer%20${token}`);
    const data = await response.json();

    if (data.status === 'success' && Array.isArray(data.data)) {
      const isFavorite = data.data.some(movie => movie.id === movieId);
      const favoriteBtn = document.getElementById('favoriteBtn');
      if (favoriteBtn) {
        const icon = favoriteBtn.querySelector('i');
        const text = favoriteBtn.querySelector('span');
        if (isFavorite) {
          icon.style.color = 'red';
          text.innerText = 'Đã yêu thích';
        } else {
          icon.style.color = '#aaa';
          text.innerText = 'Yêu thích';
        }
      }
    }
  } catch (error) {
    console.error('Lỗi kiểm tra trạng thái yêu thích:', error);
  }
}

async function checkWatchlistStatus(movieId) {
  const token = localStorage.getItem('token');
  if (!token) return;

  try {
    const response = await fetch(`${API_BASE}?controller=movie&method=getWatchlist&token=Bearer%20${token}`);
    const data = await response.json();

    if (data.status === 'success' && Array.isArray(data.data)) {
      const isInWatchlist = data.data.some(item => item.id === movieId);
      const watchlistBtn = document.getElementById('watchlistBtn');
      if (watchlistBtn) {
        const icon = watchlistBtn.querySelector('i');
        const text = watchlistBtn.querySelector('span');
        if (isInWatchlist) {
          icon.style.color = '#e50914';
          text.innerText = 'Đã thêm xem sau';
        } else {
          icon.style.color = '#aaa';
          text.innerText = 'Thêm vào xem sau';
        }
      }
    }
  } catch (error) {
    console.error('Lỗi kiểm tra trạng thái watchlist:', error);
  }



  
}